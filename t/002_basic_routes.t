use strict;
use warnings;

use lib '../lib';

use Routes::API;
use Routes::Templates;
use Test::More tests => 2;
use Plack::Test;
use JSON;
use HTTP::Request::Common;
use HTTP::Cookies;

use Data::Dump qw/dd/;

my $app = Routes::Templates->to_app;
is( ref $app, 'CODE', 'Got app' );

my $test = Plack::Test->create($app);

my $jar  = HTTP::Cookies->new();

my $res  = $test->request( GET '/login' );
ok( $res->is_success, '[GET /login] successful' );


## test login as student

#my $params = {password => "dave",  password=> "dave"}; #, type=> ["qu","wr"]};
#ok($res = $test->request(POST '/login','Content-Type' => 'application/html', Content => encode_json($params)));
$res = $test->request(POST '/login?username=dave&password=dave');
dd $res;
ok($res->is_success, '[POST /login] successful');
$jar->extract_cookies($res);

dd $jar;

my $req = GET "/welcome-student";



# add cookies to the request
$jar->add_cookie_header($req);

dd $req;

my $res = $test->request($req);
ok($res->is_success,'Session is working');
