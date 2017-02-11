use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;

use Routes::API;
use Routes::Templates;
use Test::More tests => 9;
use Test::Deep qw/cmp_deeply/;
use Plack::Test;
use JSON;
use HTTP::Request::Common qw/GET POST PUT DELETE/;
use Model::User;

my $json = JSON->new->allow_blessed(1)->convert_blessed(1);


use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);
my $res  = $test_api->request( GET '/proposals' );

ok( $res->is_success, '[GET /api/proposals] successful' );

#dd $res->{_content};

my $proposals = $json->decode($res->{_content});
# #dd $judges;
# #
is(ref($proposals),"ARRAY","[GET /api/proposals] returns an array of proposals");
# #
# # ### test to see if a single user is returned.
# # # get the id randomly from the list of users.
my $pr_num = int(rand(scalar(@$proposals)));
my $rand_id = $proposals->[$pr_num]->{_id};
#my $rand_id = "56ef54390fe696676423c654";
#
$res = $test_api->request( GET '/proposals/' . $rand_id); # . $rand_id);

# dd $res;
ok( $res->is_success, '[GET /api/proposals/_id] successful' );


### add a new user/proposal to the database;

my $user_params = {
  first_name => "Homer",
  last_name => "Simpson",
  email => 'homer@msn.com',
  falconkey => 'homer',
  role => ['student'],
  presented_before => true
};

my $user_obj = Model::User->new($user_params);
#
# my $out = $json->encode($user_obj->to_hash);
#
$res = $test_api->request(POST '/users','Content-Type' => 'application/json',
                        Content => $json->encode($user_obj->to_hash));
ok($res->is_success, '[POST /api/users] successful (new user created)');
#
#dd decode_json($res->{_content});
my $new_user = Model::User->new($json->decode($res->{_content}));

my $prop_params = {
  author_id => $new_user->{_id},
  title => "This is the title",
  content => "This is the abstract"
};

my $new_proposal = Model::Proposal->new($prop_params);

$res = $test_api->request(POST '/proposals','Content-Type' => 'application/json',
                        Content => $json->encode($new_proposal->to_hash));
ok($res->is_success, '[POST /api/proposals] successful');
# #

my $proposal2 = Model::Proposal->new($json->decode($res->{_content}));
$proposal2->title("No this is really the title");
$proposal2->sponsor_statement("YES!!!");

$res = $test_api->request(PUT '/proposals/' . $proposal2->{_id},
                            'Content-Type' => 'application/json',
                            Content => $json->encode($proposal2->to_hash));

ok($res->is_success, 'PUT [/api/proposal/:proposal_id] succesful');

my $proposal3 = Model::Proposal->new($json->decode($res->{_content}));

cmp_deeply($proposal2,$proposal3,'The update was made on the server.');

#delete the proposal

$res = $test_api->request(DELETE '/proposals/' . $proposal2->{_id});

ok($res->is_success, 'DELETE [/api/proposals/:proposal_id] succesful');

# delete the user

$res = $test_api->request(DELETE '/users/' . $new_user->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');
#
#
#
# # my $text = '{"a":"x","b":true}';
# #my $result = decode_json($text);
# #
# # my $tf = $result->{b} ? "TRUE" : "FALSE";
# # dd $result;
# # dd $tf;
# # dd true;
#
# # my $text = "{\"first_name\":\"Heather\",\"presented_before\":false,\"last_name\":\"Rotti\",\"role\":[\"judge\"],\"grad_year\":\"2016\",\"major\":\"Exercise and Sports Science\",\"falconkey\":\"hrotti\",\"email\":\"hrotti\@judge.fitchburgstate.edu\",\"_id\":\"56e6d86a93562a6b5ad30f86\"}";
# # my $result = $json->decode($text);
# #
# # dd $result;
#
#

done_testing();
