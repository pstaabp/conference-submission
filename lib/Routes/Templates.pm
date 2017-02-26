## This contains all of the html templates for the app
package Routes::Templates;
use Dancer2;

use Dancer2::Plugin::Auth::Extensible;
use Common::Collection qw/to_hashes get_all_in_collection insert_to_db update_one/;
use Data::Dump qw/dump/;
use List::Util qw/uniq/;
use JSON -no_export;
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
    redirect '/welcome-student';
  }
  if (user_has_role("sponsor")){
    redirect '/welcome';
  }
};

#### returned users general route:

get '/returned' => require_login sub {

  debug logged_in_user;
  debug get_user_details;

  if (user_has_role('student')) {
    redirect '/student';
  }
  if (user_has_role("sponsor")){
    redirect '/sponsor';
  }
};

get '/login' => sub {
    debug 'in get /login';
    template 'login', {login_failed=>query_parameters->{login_failed}};
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
          redirect '/index';
        }
        session logged_in_user => $user->{falconkey};

        redirect '/returned';
    } else {
        debug "UH OH!";
        # authentication failed
        redirect '/login?login_failed=1';
    }
};

get '/test' => sub {
  debug "in get /test";
  template 'test';
};

get '/welcome-student' => require_login sub {
  template 'welcome-student', {user=>get_user(logged_in_user->{user})};
};

get '/welcome' => require_login sub {
  my $user = get_user(logged_in_user->{falconkey});
  template 'welcome', {top_dir=>config->{top_dir},user=>$user};
};

any '/logout' => sub {
    app->destroy_session;
    template 'logout';
};

get '/student' => require_role student => sub {

  debug 'in get /student';
  my $student = get_user(logged_in_user->{falconkey});
  my $client = MongoDB->connect('mongodb://localhost');
  my $json  = JSON->new->convert_blessed->allow_blessed;
  my $collection = $client->ns(config->{database_name}.".proposals");
  my @proposals = map {Model::Proposal->new($_)}
          $collection->find({author_id=>$student->{_id}})->all;
  debug $student;
  debug to_hashes(\@proposals);
  template 'basic', {top_dir=> config->{top_dir},header_script=>"student.tt",
      user=>$student, student_encoded => $json->encode($student),
      proposals_encoded => $json->encode(to_hashes(\@proposals))
    };
};

get '/sponsor' => require_role sponsor => sub {
  my $user = get_user(logged_in_user->{falconkey});
  # my $proposals = to_hashes(get_all_in_collection($client,config->{db_name}.".proposals","Model::Proposals"));
  # my @props_as_json = map {encode_json } @$proposals;
  template 'basic', {top_dir=> config->{top_dir},header_script=>"sponsor.tt",
        user=>$user, user_encoded => encode_json($user),
        # proposals_encoded => \@props_as_json
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
  my $users = to_hashes(get_all_in_collection($client,config->{database_name}.".users","Model::User"));
  my $proposals = to_hashes(get_all_in_collection($client,
          config->{database_name}.".proposals","Model::Proposal"));
  my $mc = $client->ns(config->{database_name} . ".users");
  my $q = {role=> {'$in'=> ["judge"]}};
  my @items = map {Model::Judge->new($_); } $mc->find($q)->all;
  my $judges = to_hashes(\@items);
  $q = {role=> {'$in'=> ["sponsor"]}};
  @items = map {Model::Sponsor->new($_); } $mc->find($q)->all;
  my $sponsors = to_hashes(\@items);
  template 'basic', {top_dir=> config->{top_dir},header_script=>"admin.tt",
        user=>$user, user_encoded => $json->encode($user),
        users=>$json->encode($users),
        proposals => $json->encode($proposals),
        judges => $json->encode($judges),
        sponsors => $json->encode($sponsors)
      };
};

sub get_user {
  my $username = shift;
  my $client = MongoDB->connect('mongodb://localhost');
  my $collection = $client->ns(config->{database_name} . ".users");
  my $user = $collection->find_one({falconkey => $username});
  $user->{_id} = $user->{_id}->{value} if defined($user);
  return $user;
}

sub login_page {
  debug "in login_page";
  template 'login';
}

sub getAllData {
    my $client = MongoDB->connect('mongodb://localhost');
    # print "in getAllData\n";
    my $authors = to_hashes(get_all_in_collection($client,"problemdb.authors","Model::Author"));
    my $modules = to_hashes(get_all_in_collection($client,"problemdb.modules","Model::Module"));
    my $problems = to_hashes(get_all_in_collection($client,"problemdb.problems","Model::Problem"));
    my $problem_sets = to_hashes(get_all_in_collection($client,"problemdb.problemsets","Model::ProblemSet"));

    return {  authors => to_json($authors),
              modules=> to_json($modules),
              problems => to_json($problems),
              problem_sets => to_json($problem_sets) };
}

true;
