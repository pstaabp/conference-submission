use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;

use Routes::API;
use Routes::Templates;
use Test::More tests => 7;
use Test::Deep qw/cmp_deeply/;
use Plack::Test;
use JSON;
use HTTP::Request::Common qw/GET POST PUT DELETE/;
use Model::Judge;

my $json = JSON->new->allow_blessed(1)->convert_blessed(1);


use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);
my $res  = $test_api->request( GET '/judges' );

ok( $res->is_success, '[GET /api/judges] successful' );

#dd $res->{_content};

my $judges = $json->decode($res->{_content});
# #dd $judges;
# #
is(ref($judges),"ARRAY","[GET /api/judges] returns an array");
#
# ### test to see if a single user is returned.
# # get the id randomly from the list of users.
my $user_num = int(rand(scalar(@$judges)));
my $rand_id = $judges->[$user_num]->{_id};

$res = $test_api->request( GET '/judges/' . $rand_id); # . $rand_id);
ok( $res->is_success, '[GET /api/judges/_id] successful' );


### add a new user to the database;

my $user_params = {
  first_name => "Homer",
  last_name => "Simpson",
  email => 'homer@msn.com',
  falconkey => 'homer',
  role => ['judge'],
  presented_before => true
};

my $user_obj = Model::User->new($user_params);


$res = $test_api->request(POST '/users','Content-Type' => 'application/json',
  Content => $json->encode($user_obj->TO_JSON));
ok($res->is_success, '[POST /api/users] successful');

# # dd decode_json($res->{_content});
#
my $judge = Model::Judge->new($json->decode($res->{_content}));
#$judge->department("Mathematics");
# $judge->presented_before(true);
# $judge->major("Mathematics");

#dd $judge;
#
## update the user as a judge

#dd "printing out the hash";

$res = $test_api->request(PUT '/judges/' . $judge->{_id},'Content-Type' => 'application/json',
                              Content => $json->encode($judge->TO_JSON));
ok($res->is_success, '[PUT /api/judges/:judges_id] successful');



# my $client = MongoDB->connect('mongodb://localhost');
#
# # check if user already exists
# my $coll = $client->ns("conf-2016.users");
#
# my $result = $coll->insert_one({username=>'user',test=>true});
#
# dd $result;

## check that that database was updated correctly.

$res = $test_api->request(GET '/judges/' . $judge->{_id});

# # dd decode_json($res->{_content});
my $judge2 = Model::Judge->new(decode_json($res->{_content}));

cmp_deeply($judge,$judge2,'The judge was updated successfully');
#
# delete the user

$res = $test_api->request(DELETE '/users/' . $judge->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');



# my $text = '{"a":"x","b":true}';
#my $result = decode_json($text);
#
# my $tf = $result->{b} ? "TRUE" : "FALSE";
# dd $result;
# dd $tf;
# dd true;

# my $text = "{\"first_name\":\"Heather\",\"presented_before\":false,\"last_name\":\"Rotti\",\"role\":[\"judge\"],\"grad_year\":\"2016\",\"major\":\"Exercise and Sports Science\",\"falconkey\":\"hrotti\",\"email\":\"hrotti\@judge.fitchburgstate.edu\",\"_id\":\"56e6d86a93562a6b5ad30f86\"}";
# my $result = $json->decode($text);
#
# dd $result;



#done_testing();
