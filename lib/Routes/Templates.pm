## This contains all of the html templates for the app
package Routes::Templates;
use Dancer2;

use Dancer2::Plugin::Auth::Extensible;
use Dancer2::Plugin::Email;
use Common::Collection qw/get_one_by_id get_all_in_collection insert_to_db update_one/;
use Data::Dump qw/dump/;
use List::Util qw/uniq first/;
use JSON -no_export;
use MongoDB::OID;
use Model::Sponsor;
use Model::Judge;

# This sets that if there is a template in the view direction a route is automatically generated.
set auto_page => 0;

get '/' => sub {
    redirect '/index';
};

####

get '/index' =>  require_login sub {
  debug session;
  debug logged_in_user;
  if (user_has_role('student')) {
    redirect config->{top_dir} .'/welcome-student';
  }
  if (user_has_role("sponsor")){
    redirect config->{top_dir} .'/welcome';
  }
};

#### returned users general route:

get '/returned' => require_login sub {

  debug logged_in_user;
  debug get_user_details(logged_in_user->{falconkey});
  debug user_roles(logged_in_user->{falconkey});

  if (user_has_role('student')) {
    redirect config->{server_name} . config->{top_dir} .'/student';
  }
  if (user_has_role("sponsor")){
    redirect config->{server_name} . config->{top_dir} .'/sponsor';
  }
};

get '/login' => sub {
    debug 'in get /login';
    template 'login', {top_dir=>config->{top_dir},login_failed=>query_parameters->{login_failed}};
};

post '/login' => sub {
    debug "in post /login";
    my ($success, $realm) = authenticate_user(
        params->{username}, params->{password}
    );

    debug $success;
    debug $realm;

    if ($success) {
        # change session ID if we have a new enough D2 version with support
        # (security best practice on privilege level change)
        app->change_session_id if app->can('change_session_id');

        session logged_in_user_realm => $realm;

        # check if the user is in the database
        my $user = get_user(params->{username});

        debug $user;
        if(not defined($user)){
          my $client = MongoDB->connect('mongodb://localhost');
          debug get_user_details(params->{username});
          my $user_details = Model::User->new(get_user_details(params->{username}));
          insert_to_db($client,config->{database_name} . ".users", $user_details);
          session logged_in_user => $user_details->{falconkey};
          redirect config->{top_dir} .'/index';
        }
        session logged_in_user => $user->{falconkey};

        redirect config->{server_name} . config->{top_dir} .'/returned';
    } else {
        debug "UH OH!";
        # authentication failed
        redirect config->{server_name} . config->{top_dir} . '/login?login_failed=1';
    }
};

get '/test' => sub {
  debug "in get /test";
  template 'test', {top_dir=>config->{top_dir}};
};

get '/welcome-student' => require_login sub {
  template 'welcome-student', {top_dir=>config->{top_dir},user=>get_user(logged_in_user->{user})};
};

get '/welcome' => require_login sub {
  my $user = get_user(logged_in_user->{falconkey});
  template 'welcome', {top_dir=>config->{top_dir},user=>$user};
};

any '/logout' => sub {
    app->destroy_session;
    template 'logout', {top_dir =>config->{top_dir}};
};

get '/submitted/:proposal_id' => sub {
  my $user = get_user(logged_in_user->{falconkey});
  my $client = MongoDB->connect('mongodb://localhost');
  my $user_collection = $client->ns(config->{database_name} . ".users");
  my $proposal = get_one_by_id($client,config->{database_name} . ".proposals",'Model::Proposal',route_parameters->{proposal_id});
  my $json  = JSON->new->convert_blessed->allow_blessed;
  my $sponsor = get_one_by_id($client,config->{database_name} . ".users",'Model::Sponsor',$proposal->{sponsor_id});
  my @other_authors;
  for my $fc (@{$proposal->{other_authors}}){
      my $user = Model::User->new($user_collection->find_one({falconkey=>$fc}));
      push(@other_authors,$user);
  }

  my $text = '';
  my $tt = Template->new({
    INCLUDE_PATH => '../../views',
    INTERPOLATE  => 1,
    OUTPUT => \$text
  }) || die "$Template::ERROR\n";


  my $params = {top_dir => config->{top_dir},
    user=>$user, proposal=>$proposal,sponsor=>$sponsor,
    other_authors => \@other_authors};

  my $out = $tt->process('proposal-received.t',$params);

  debug $Template::ERROR;
  debug $text;
  debug $out;


  # my $email = email {
  #     from    => 'ugrad-conf@fitchburgstate.edu',
  #     to      => $user->{email},
  #     subject => '2017 FSU Undergraduate Conference Submission',
  #     body    => ,
  # };

  template 'proposal-received', $params;

};

#get '/student' => require_role student => sub {
get '/student' => sub {

  debug 'in get /student';
  my $student = get_user(logged_in_user->{falconkey});
  my $client = MongoDB->connect('mongodb://localhost');
  my $json  = JSON->new->convert_blessed->allow_blessed;
  my $proposal_collection = $client->ns(config->{database_name}.".proposals");
  my $user_collection = $client->ns(config->{database_name}.".users");

  my @proposals = map {Model::Proposal->new($_)}
          $proposal_collection->find({author_id=>$student->{_id}})->all;
  my @other_authors;
  for my $prop (@proposals){
      for my $fc (@{$prop->{other_authors}}){
        debug $fc;
        my $user = Model::User->new($user_collection->find_one({falconkey=>$fc}));
        push(@other_authors,$user);
      }
  }
  template 'basic', {top_dir=> config->{top_dir},header_script=>"student.tt",
      user=>$student, student_encoded => $json->encode($student),
      proposals_encoded => $json->encode(\@proposals),
      users => $json->encode(\@other_authors)
    };
};

get '/sponsor' => require_role sponsor => sub {
  my $json  = JSON->new->convert_blessed->allow_blessed;
  my $user = get_user(logged_in_user->{falconkey});
  my $client = MongoDB->connect('mongodb://localhost');
  my $proposal_collection = $client->ns(config->{database_name}.".proposals");
  my $user_collection = $client->ns(config->{database_name}.".users");
  my @proposals =  map {Model::Proposal->new($_)} $proposal_collection->find({sponsor_id=>$user->{_id}})->all;
  my @all_authors = map {
    debug dump $_->{author_id};
    my $id_obj = MongoDB::OID->new(value=>$_->{author_id});
    Model::User->new($user_collection->find_one({_id=>$id_obj}));
  } @proposals;
  for my $prop (@proposals){
      for my $fc (@{$prop->{other_authors}}){
        my $user = Model::User->new($user_collection->find_one({falconkey=>$fc}));
        push(@all_authors,$user);
      }
  }
 
  template 'basic', {top_dir=> config->{top_dir},header_script=>"sponsor.tt",
        user=>$user, user_encoded => encode_json($user),
        proposals=>$json->encode(\@proposals), users=>$json->encode(\@all_authors)
      };
};

## update the user settings

post '/user' => require_login sub {
  debug "in post /user";
  debug body_parameters;

  my $user = Model::User->new(get_user(logged_in_user->{falconkey}));
  my @roles = body_parameters->keys;
  push @roles, @{$user->{role}};
  debug \@roles;
  @roles = uniq @roles;
  $user->role(\@roles);
  my $client = MongoDB->connect('mongodb://localhost');
  my $result = update_one($client,config->{database_name}.".users",$user);

  redirect '/sponsor';
};

### Admin route_parameters

get '/admin' => require_login sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = get_user(logged_in_user->{falconkey});
  my $json  = JSON->new->convert_blessed->allow_blessed;
  my $users = get_all_in_collection($client,config->{database_name}.".users","Model::User");
  my $proposals = get_all_in_collection($client,config->{database_name}.".proposals","Model::Proposal");
  my $mc = $client->ns(config->{database_name} . ".users");
  my $q = {role=> {'$in'=> ["judge"]}};
  my @judges = map {Model::Judge->new($_); } $mc->find($q)->all;
  $q = {role=> {'$in'=> ["sponsor"]}};
  my @sponsors = map {Model::Sponsor->new($_); } $mc->find($q)->all;
  template 'basic', {top_dir=> config->{top_dir},header_script=>"admin.tt",
        user=>$user, user_encoded => $json->encode($user),
        users=>$json->encode($users),
        proposals => $json->encode($proposals),
        judges => $json->encode(\@judges),
        sponsors => $json->encode(\@sponsors)
      };
};

### I think this should be in the Auth::Extensible package, but works okay.

sub get_user {
  my $username = shift;


  my $client = MongoDB->connect('mongodb://localhost');
  my $collection = $client->ns(config->{database_name} . ".users");
  my $user = $collection->find_one({falconkey => $username});
  $user->{_id} = $user->{_id}->{value} if defined($user);
  return $user if defined($user);

  ## first look for the user in the envinroment config.
  my $users = config->{plugins}->{"Auth::Extensible"}->{realms}->{local}->{users};
  $user = first { debug($_); $_->{falconkey} eq $username } @$users;
  return $user if defined($user);

  return {};
}

sub login_page {
  debug "in login_page";
  template 'login';
}


true;
