use strictures 2;
use feature 'say';
use lib '../lib';

use Routes::API;
use Routes::Templates;
use Test::More tests => 7;
use Test::Deep qw/cmp_deeply/;
use Plack::Test;
use JSON;
use HTTP::Request::Common qw/GET POST PUT DELETE/;
use Model::User;

use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);
my $res  = $test_api->request( GET '/users' );

ok( $res->is_success, '[GET /api/users] successful' );

my $users = decode_json $res->content;

is(ref($users),"ARRAY","[GET /api/users] returns an array");

### test to see if a single user is returned.
# get the id randomly from the list of users.
my $user_num = int(rand(scalar(@$users)));
my $rand_id = $users->[$user_num]->{_id};

$res = $test_api->request( GET '/users/' . $rand_id);
ok( $res->is_success, '[GET /api/users/_id] successful' );


### add a new user to the database;

my $user_params = {
  first_name => "Homer",
  last_name => "Simpson",
  email => 'homer@msn.com',
  falconkey => 'homer',
  role => ['sponsor']
};

my $user_obj = Model::User->new($user_params);
$res = $test_api->request(POST '/users','Content-Type' => 'application/json', Content => encode_json($user_obj->to_hash));

ok($res->is_success, '[POST /api/users] successful');

#dd decode_json($res->{_content});

$user_obj= Model::User->new(decode_json($res->{_content}));

# change the user's email and update

$user_obj->email('homer@gmail.com');
$res = $test_api->request(PUT '/users/' . $user_obj->{_id},'Content-Type' => 'application/json', Content => encode_json($user_obj->to_hash));
ok($res->is_success, '[PUT /api/users/:user_id] successful');

# TODO:  check that the update went through.

$res = $test_api->request(GET '/users/' . $user_obj->{_id});
my $user2 = Model::User->new(decode_json($res->{_content}));

cmp_deeply($user_obj,$user2,'The user was updated successfully');

# delete the user

$res = $test_api->request(DELETE '/users/' . $user_obj->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');

## TODO: check that it was actually deleted.




# $res = $test_api->request(GET '/problems/' . $problems->[2]->{_id});
# ok($res->is_success, '[GET /api/problems/'. $problems->[2]->{_id} .'] successful.');
# #dd $modules;
#
# ## test the templating routes:
#
# my $test_template = Plack::Test->create(Routes::Templates->to_app);
#
# $res = $test_template->request(GET '/problems/' . $problems->[2]->{_id});
#
# ok( $res->is_success, '[GET /problems/' . $problems->[2]->{_id} .'] successful' );
#
# ### test latexing
#
# $res = $test_api->request(POST '/problems/'. $problems->[2]->{_id} . '/latex');
# ok( $res->is_success, '[POST /api/problems/' . $problems->[2]->{_id} .'/latex] successful' );
# #
#
# #
# ####
# ##  Create a new problem
# ####
# my $params = {text_md => "This is a new problem", solution_md => "This is the solution"}; #, type=> ["qu","wr"]};
# $res = $test_api->request(POST '/problems','Content-Type' => 'application/json', Content => encode_json($params));
#
# my $obj = from_json($res->content);
#
# ok($res->is_success, '[POST /problems] successful.');
#
# ###
# #   Delete the problem just created.
# ###
#
# $res = $test_api->request(DELETE '/problems/' . $obj->{_id});
# ok($res->is_success, '[DELETE /problems/'. $obj->{_id}. '] successful');
#


done_testing();
