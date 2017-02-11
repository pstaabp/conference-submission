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
use Model::Student;

my $json = JSON->new->allow_blessed(1)->convert_blessed(1);


use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);
my $res  = $test_api->request( GET '/students' );

ok( $res->is_success, '[GET /api/students] successful' );

my $students = $json->decode($res->{_content});

# #
is(ref($students),"ARRAY","[GET /api/students] returns an array");
#
# ### test to see if a single user is returned.
# # get the id randomly from the list of users.
my $user_num = int(rand(scalar(@$students)));

my $rand_id = $students->[$user_num]->{_id};

$res = $test_api->request( GET '/students/' . $rand_id); # . $rand_id);
ok( $res->is_success, '[GET /api/students/_id] successful' );


### add a new user to the database;

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

$res = $test_api->request(POST '/users','Content-Type' => 'application/json', Content => $json->encode($user_obj->to_hash));

# dd $res;
ok($res->is_success, '[POST /api/users] successful');

#
my $student = Model::Student->new($json->decode($res->{_content}));
#$student->department("Mathematics");
$student->presented_before(true);
$student->major("Mathematics");

# dd $student;
# my $user2 = $coll->find_one({falconkey=>"homer"});
#
# dd $user2;
#
## update the user as a student

#dd "printing out the hash";
#dd $student->to_hash;

$res = $test_api->request(PUT '/students/' . $student->{_id},'Content-Type' => 'application/json',
                              Content => $json->encode($student->to_hash));
ok($res->is_success, '[PUT /api/students/:students_id] successful');





# check if user already exists

my $client = MongoDB->connect('mongodb://localhost');
my $coll = $client->ns("conf-2016.users");

# check that that database was updated correctly.

$res = $test_api->request(GET '/students/' . $student->{_id});

my $student2 = Model::Student->new(decode_json($res->{_content}));

dd $student2; 

cmp_deeply($student,$student2,'The student was updated successfully');
# #
# # delete the user
#
$res = $test_api->request(DELETE '/users/' . $student->{_id});
ok($res->is_success, '[DELETE /api/users/:user_id] successful');



# my $text = '{"a":"x","b":true}';
#my $result = decode_json($text);
#
# my $tf = $result->{b} ? "TRUE" : "FALSE";
# dd $result;
# dd $tf;
# dd true;

# my $text = "{\"first_name\":\"Heather\",\"presented_before\":false,\"last_name\":\"Rotti\",\"role\":[\"student\"],\"grad_year\":\"2016\",\"major\":\"Exercise and Sports Science\",\"falconkey\":\"hrotti\",\"email\":\"hrotti\@student.fitchburgstate.edu\",\"_id\":\"56e6d86a93562a6b5ad30f86\"}";
# my $result = $json->decode($text);
#
# dd $result;



#done_testing();
