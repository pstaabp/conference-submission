use strictures 2;
use feature 'say';
use lib '../lib';

use Routes::API;
use Routes::Templates;
use Test::More tests => 7;
use Test::Deep qw/cmp_deeply/;
use Plack::Test;
use JSON -no_export;
use HTTP::Request::Common qw/GET POST PUT DELETE/;
use Model::Sponsor;
my $json = JSON->new->allow_blessed(1)->convert_blessed(1);

use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);
my $res  = $test_api->request( GET '/sponsors' );

ok( $res->is_success, '[GET /api/sponsors] successful' );

my $sponsors = $json->decode($res->{_content});

is(ref($sponsors),"ARRAY","[GET /api/sponsors] returns an array");

### test to see if a single user is returned.
# get the id randomly from the list of users.
my $user_num = int(rand(scalar(@$sponsors)));
my $rand_id = $sponsors->[$user_num]->{_id};
#
$res = $test_api->request( GET '/sponsors/' . $rand_id);
ok( $res->is_success, '[GET /api/sponsors/_id] successful' );



#
# ### add a new user to the database;
#
my $user_params = {
  first_name => "Homer",
  last_name => "Simpson",
  email => 'homer@msn.com',
  falconkey => 'homer',
  role => ['sponsor']
};

my $user_obj = Model::User->new($user_params);
$res = $test_api->request(POST '/users','Content-Type' => 'application/json', Content => $json->encode($user_obj));
ok($res->is_success, '[POST /api/users] successful');

# dd decode_json($res->{_content});

my $sponsor = Model::Sponsor->new($json->decode($res->{_content}));
$sponsor->department("Mathematics");

## update the user as a sponsor

$res = $test_api->request(PUT '/sponsors/' . $sponsor->{_id},'Content-Type' => 'application/json',
Content => $json->encode($sponsor));
ok($res->is_success, '[PUT /api/users/:user_id] successful');

## check that that database was updated correctly.

$res = $test_api->request(GET '/sponsors/' . $sponsor->{_id});

# dd decode_json($res->{_content});
my $sponsor2 = Model::Sponsor->new($json->decode($res->{_content}));

cmp_deeply($sponsor,$sponsor2,'The sponsor was updated successfully');
#
# delete the user

$res = $test_api->request(DELETE '/users/' . $sponsor->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');


done_testing();
