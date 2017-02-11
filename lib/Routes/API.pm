package Routes::API;
use Dancer2;

set serializer => 'JSON';
use MongoDB;
use MongoDB::OID;
use Model::User;
use Model::Student;
use Model::Judge;

use Common::Collection qw/to_hashes get_one_by_id insert_to_db get_all_in_collection
            delete_one_by_id update_one/;
use Data::Dump qw/dump/;
use Types::Standard qw/ArrayRef Str/;

# hook before_serializer => sub {
#   debug "in before_serializer";
#   my $self = shift;
#   debug dump $self;
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
#
# hook after_serializer => sub {
#   debug "in after_serializer";
#   my $serialized_content = shift;
#   debug $serialized_content;
# };

### User Routes

get '/users' => sub { # get all users
    my $client = MongoDB->connect('mongodb://localhost');
    my $users = get_all_in_collection($client,config->{database_name}.".users","Model::User");
    return to_hashes($users);
};


###
#  get a single user with id :user_id
#
#  return a hash of the problem.
###


get '/users/:user_id' => sub {
   debug dump "in get /users/:user_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $user = get_one_by_id($client,config->{database_name} . ".user",'Model::User',route_parameters->{user_id});
   return $user->to_hash;
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
  return $result->to_hash;
};

## update the user by _id

put '/users/:user_id' => sub {
  debug "in put /users/:user_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";
  my $updated_user = Model::User->new($params);
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".user",$updated_user);

  return $user->to_hash;
};

# delete a user using _id

del '/users/:user_id' => sub {
  debug "in delete /users/:user_id";
  my $client = MongoDB->connect('mongodb://localhost');
  my $deleted_user = delete_one_by_id($client,config->{database_name} . ".users",'Model::User',route_parameters->{user_id});
  return $deleted_user->to_hash;
};

###
#
#  Sponsor routes
#
####

get '/sponsors' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns(config->{database_name} . ".user");
  my $q = {role=> {'$in'=> ["sponsor"]}};
  my @items = map {Model::Sponsor->new($_); } $mc->find($q)->all;
  return to_hashes(\@items);
};



get '/sponsors/:sponsor_id' => sub {
   debug dump "in get /sponsors/:sponsor_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $sponsor = get_one_by_id($client,config->{database_name} . ".user",'Model::Sponsor',route_parameters->{sponsor_id});
   ## TODO:  check that this user has a sponsor role
   return $sponsor->to_hash;
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
  my $user = update_one($client,config->{database_name} . ".user",'Model::User',$updated_user);

  return $user->to_hash;
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

  return to_hashes(\@items);
};



get '/students/:student_id' => sub {
   debug "in get /students/:student_id";
   debug route_parameters->{student_id};
   my $client = MongoDB->connect('mongodb://localhost');
   my $student = get_one_by_id($client,config->{database_name} . ".users",'Model::Student',route_parameters->{student_id});

  #  debug dump $student;
   ## TODO:  check that this user has a student` role
   return $student->to_hash;
};

### Note:

# there is not a post for a student, because a student is a user, post as a user instead

put '/students/:student_id' => sub {
  debug "in put /students/:student_id";
  my $params =  body_parameters->mixed;
  $params->{role}= [$params->{role}] unless ref($params->{role}) eq "ARRAY";

  my $updated_user = Model::Student->new($params);
  my $client = MongoDB->connect('mongodb://localhost');
  my $user = update_one($client,config->{database_name} . ".users",$updated_user);

  return $user->to_hash;
};


###
#
#  judges routes
#
####

get '/judges' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns(config->{database_name} . ".user");
  my $q = {role=> {'$in'=> ["judge"]}};
  my @items = map {Model::Judge->new($_); } $mc->find($q)->all;
  #debug dump $mc->find($q)->all;
  return to_hashes(\@items);
  #return \@items;
};



get '/judges/:judge_id' => sub {
   debug dump "in get /judges/:judge_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $judge = get_one_by_id($client,config->{database_name} . ".user",'Model::Judge',route_parameters->{judge_id});

   ## TODO:  check that this user has a student` role
   return $judge->to_hash;
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
  my $user = update_one($client,config->{database_name} . ".user",'Model::Judge',$updated_user);

  return $user->to_hash;
};

true;
