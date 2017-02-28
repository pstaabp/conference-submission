package Routes::API;
use Dancer2;

set serializer => 'JSON';
use MongoDB;
use MongoDB::OID;
use Net::LDAP;
use Model::User;
use Model::Student;
use Model::Judge;
use Model::Proposal;

use Common::Collection qw/get_one_by_id insert_to_db get_all_in_collection
            delete_one_by_id update_one/;
use Data::Dump qw/dump/;
use Types::Standard qw/ArrayRef Str/;

# hook before_serializer => sub {
#   debug "in before_serializer";
#   my $content = shift;
#   debug $content;
# #   my $hash = {};
# #   for my $key (keys %$self){
# #     if (ref($self->{$key}) eq "boolean") {
# #       $hash->{$key} = ($self->{$key})?true:false;
# #     } else {
# #       $hash->{$key} = $self->{$key};
# #     }
# #   }
# #   debug dump $hash;
# };

# hook after_serializer => sub {
#   debug "in after_serializer";
#   my $serialized_content = shift;
#   debug $serialized_content;
# };

### User Routes

get '/users' => sub { # get all users
    my $client = MongoDB->connect('mongodb://localhost');
    my $users = get_all_in_collection($client,config->{database_name}.".users","Model::User");
    return $users;
};


###
#  get a single user with id :user_id
#
#  return a hash of the problem.
###


get '/users/:user_id' => sub {
   debug dump "in get /users/:user_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $user = get_one_by_id($client,config->{database_name} . ".users",'Model::User',route_parameters->{user_id});
   return $user->TO_JSON;
};

post '/users' => sub { # add a new user
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";
  my $new_user = Model::User->new($params);
  my $client = MongoDB->connect('mongodb://localhost');

  # check if user already exists
  my $coll = $client->ns(config->{database_name}. ".users");
  my $u = $coll->find_one({falconkey => $new_user->{falconkey}});
  if ($u){
    return {success=>false,msg=>"A user with falconkey ". $new_user->{falconkey} ." already exists"};
  }

  my $result = insert_to_db($client,config->{database_name} . ".users",$new_user);
  return $result->TO_JSON;
};

## update the user by _id

put '/users/:user_id' => sub {
  debug "in put /users/:user_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";
  my $updated_user = Model::User->new($params);
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".users","Model::User",$updated_user);

  return $user->TO_JSON;
};

# delete a user using _id

del '/users/:user_id' => sub {
  debug "in delete /users/:user_id";
  my $client = MongoDB->connect('mongodb://localhost');
  my $deleted_user = delete_one_by_id($client,config->{database_name} . ".users",'Model::User',route_parameters->{user_id});
  return Model::User->new($deleted_user)->TO_JSON;
};

# check if a particular user with a given falconkey exists

get '/users/:falconkey/check' => sub {
  debug "in get /users/:falconkey/check";

  # first check if the person is already in the database

  my $client = MongoDB->connect("mongodb://localhost");
  my $collection = $client->ns(config->{database_name} . ".users");
  my $result = $collection->find_one({falconkey=>route_parameters->{falconkey}});

  return Model::Sponsor->new($result)->TO_JSON if defined($result);

  my $ldap = new Net::LDAP(config->{ldap_server});
  my $msg = $ldap->bind(config->{ldap_bind}, password => config->{ldap_password} );
  my $search = $ldap->search(base => '', filter => "sAMAccountName=" . route_parameters->{falconkey});
  my $entry = $search->entry(0);

  ## need to check if the search succeeded.

  ## create a new user

  my $params = {
    last_name => $entry->get_value("sn") ||"",
    first_name => $entry->get_value("givenName") ||"",
    email =>  $entry->get_value("mail")
  };

  if($entry->get_value("mail") =~ /\@student\./){
    $params->{role} = ["student"];
    return Model::User->($params)->TO_JSON;
  } else {
    $params->{role} = ["sponsor"];
    $params->{department} = $entry->get_value("department") ||"";
    return Model::Sponsor->($params)->TO_JSON;
  }

  # return (defined($entry))?
  #    {last_name => $entry->get_value("sn") ||"",
  #   first_name => $entry->get_value("givenName") ||"",
  #   email =>  $entry->get_value("mail") || "",
  #   other =>  $entry->get_value("description") || "",
  #
  # }: {};
};

###
#
#  Sponsor routes
#
####

get '/sponsors' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns(config->{database_name} . ".users");
  my $q = {role=> {'$in'=> ["sponsor"]}};
  my @items = map {Model::Sponsor->new($_); } $mc->find($q)->all;
  return \@items;
};



get '/sponsors/:sponsor_id' => sub {
   debug dump "in get /sponsors/:sponsor_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $sponsor = get_one_by_id($client,config->{database_name} . ".users",'Model::Sponsor',route_parameters->{sponsor_id});
   ## TODO:  check that this user has a sponsor role
   return $sponsor->TO_JSON;
};

### Note:

# there is not a post for a sponsor, because a sponsor is a user, post as a user instead

put '/sponsors/:sponsor_id' => sub {
  debug "in put /sponsor/:sponsor_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";
  my $updated_user = Model::Sponsor->new($params);
  # dd $updated_user;
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".users",'Model::Sponsor',$updated_user);

  return $user->TO_JSON;
};

###
#
#  student routes
#
####

get '/students' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns(config->{database_name} . ".users");
  my $q = {role=> {'$in'=> ["student"]}};
  my @items = map {Model::Student->new($_); } $mc->find($q)->all;

  return \@items;
};



get '/students/:student_id' => sub {
   debug "in get /students/:student_id";
   debug route_parameters->{student_id};
   my $client = MongoDB->connect('mongodb://localhost');
   my $student = get_one_by_id($client,config->{database_name} . ".users",'Model::Student',route_parameters->{student_id});

  #  debug dump $student;
   ## TODO:  check that this user has a student` role
   return $student->TO_JSON;
};

### Note:

# there is not a post for a student, because a student is a user, post as a user instead

put '/students/:student_id' => sub {
  debug "in put /students/:student_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";

  my $updated_user = Model::Student->new($params);
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".users","Model::User",$updated_user);

  return $user->TO_JSON;
};


###
#
#  judges routes
#
####

get '/judges' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns(config->{database_name} . ".users");
  my $q = {role=> {'$in'=> ["judge"]}};
  my @items = map {Model::Judge->new($_); } $mc->find($q)->all;
  #debug dump $mc->find($q)->all;
  return \@items;
  #return \@items;
};



get '/judges/:judge_id' => sub {
   debug dump "in get /judges/:judge_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $judge = get_one_by_id($client,config->{database_name} . ".users",'Model::Judge',route_parameters->{judge_id});

   ## TODO:  check that this user has a student` role
   return $judge->TO_JSON;
};

### Note:

# there is not a post for a student, because a student is a user, post as a user instead

put '/judges/:judge_id' => sub {
  debug "in put /judges/:judge_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";

  my $updated_user = Model::Judge->new($params);
  # dd $updated_user;
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".users",'Model::Judge',$updated_user);

  return $user->TO_JSON;
};

###
#
# Proposal routes
#
###

get '/proposals' => sub {
  debug 'in get /proposals';
  my $client = MongoDB->connect('mongodb://localhost');
  my $proposals = get_all_in_collection($client,config->{database_name}.".proposals","Model::Proposal");
  return $proposals;

};


get '/proposals/:proposal_id' => sub {
   debug "in get /proposal/:proposal_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $proposal = get_one_by_id($client,config->{database_name} . ".proposals",'Model::Proposal',route_parameters->{proposal_id});

  #  debug dump $student;
   ## TODO:  check that this user has a student` role
   return $proposal->TO_JSON;
};

# get all proposals for student :student_id

get '/students/:student_id/proposals' => sub { # add a new user
  #my $new_proposal = Model::User->new(body_parameters->as_hashref);
  my $client = MongoDB->connect('mongodb://localhost');
  my $collection = $client->ns(config->{database_name} . ".proposals");
  my @results = map {Model::Proposal->new($_)}
          $collection->find({author_id => route_parameters->{student_id}})->all;
  #debug dump @results;
  return \@results;
};

post '/students/:student_id/proposals' => sub {
    debug 'in POST /students/:student_id/proposals';
    my $params = body_parameters->mixed;
    $params->{other_authors}= [$params->{other_authors}] unless ref($params->{other_authors}) eq "ARRAY";
    my $new_proposal = Model::Proposal->new($params);
    # dd $new_proposal;
    my $client = MongoDB->connect('mongodb://localhost');
    my $result = insert_to_db($client,config->{database_name} . ".proposals",$new_proposal);
    return $result->TO_JSON;
};


put '/students/:student_id/proposals/:proposal_id' => sub {
  debug "in put /proposals/:proposal_id";
  my $params = body_parameters->mixed;
  $params->{other_authors}= [$params->{other_authors}] unless ref($params->{other_authors}) eq "ARRAY";

  my $updated_proposal = Model::Proposal->new($params);
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".proposals","Model::Proposal",$updated_proposal);

  return $user->TO_JSON;
};

del '/students/:student_id/proposals/:proposal_id' => sub {
  debug "in delete /proposals/:proposal_id";
  my $client = MongoDB->connect('mongodb://localhost');
  my $deleted_proposal = delete_one_by_id($client,config->{database_name} . ".proposals",
            'Model::Proposal',route_parameters->{proposal_id});
  return Model::Proposal->new($deleted_proposal)->TO_JSON;
};




true;
