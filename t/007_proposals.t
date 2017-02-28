use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;

use Routes::API;
use Routes::Templates;
use Test::More tests => 11;
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
dd $res;
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

my $out = $json->encode($user_obj->to_hash);

$res = $test_api->request(POST '/users','Content-Type' => 'application/json',
                        Content => $json->encode($user_obj->to_hash));
ok($res->is_success, '[POST /api/users] successful (new user created)');

# dd decode_json($res->{_content});
my $new_user = Model::User->new($json->decode($res->{_content}));

my $prop_params = {
  author_id => $new_user->{_id},
  title => "This is the title",
  content => "This is the abstract",
  submit_date => 1487111603
};

# dd $prop_params;

my $new_proposal = Model::Proposal->new($prop_params);

$res = $test_api->request(POST '/students/' . $new_user->{_id} . "/proposals",
                      'Content-Type' => 'application/json',
                      Content => $json->encode($new_proposal->to_hash));
# dd $res;
ok($res->is_success, '[POST /api/students/:student_id/proposals] successful');



# #

my $proposal2 = Model::Proposal->new($json->decode($res->{_content}));
$proposal2->title("No this is really the title");
$proposal2->sponsor_statement("YES!!!");

# dd $proposal2;

$res = $test_api->request(PUT '/proposals/' . $proposal2->{_id},
                            'Content-Type' => 'application/json',
                            Content => $json->encode($proposal2->to_hash));

ok($res->is_success, 'PUT [/api/proposal/:proposal_id] succesful');

my $proposal3 = Model::Proposal->new($json->decode($res->{_content}));

cmp_deeply($proposal2,$proposal3,'The update was made on the server.');

## add another proposal for the student

$prop_params = {
  author_id => $new_user->{_id},
  title => "This is another title",
  content => "This is another abstract",
  submit_date=>"2016-03-21T01:49:43.909Z",
};

my $another_proposal = Model::Proposal->new($prop_params);
#dd 'POST' . '/students/' . $new_user->{_id} . '/proposals';
$res = $test_api->request(POST '/students/' . $new_user->{_id} . '/proposals',
                        'Content-Type' => 'application/json',
                        Content => $json->encode($new_proposal->to_hash));
#dd $res;

ok($res->is_success, '[POST /api/users/:user_id/proposals] successful');


# get all proposals by the student

$res = $test_api->request(GET '/students/' . $another_proposal->{author_id} . '/proposals');
ok($res->is_success, '[GET /api/students/:student_id/proposals] successful');

my $props = $json->decode($res->{_content});

my @p = map { Model::Proposal->new($_);} @$props;

#delete the proposal

$res = $test_api->request(DELETE '/proposals/' . $proposal2->{_id});

ok($res->is_success, 'DELETE [/api/proposals/:proposal_id] succesful');

# delete the user

$res = $test_api->request(DELETE '/users/' . $new_user->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');
#

done_testing();
