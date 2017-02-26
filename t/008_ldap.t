use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;

use Routes::API;
use Test::More tests => 1;
#use Test::Deep qw/cmp_deeply/;
use Plack::Test;
#use JSON;
use HTTP::Request::Common qw/GET POST PUT DELETE/;
#use Model::User;

#my $json = JSON->new->allow_blessed(1)->convert_blessed(1);


use Data::Dump qw/dd/;


## test that the /problems route exists

my $test_api = Plack::Test->create(Routes::API->to_app);

my $res  = $test_api->request( GET '/users/pstaab/check' );

dd $res->{_content};

$res  = $test_api->request( GET '/users/superman/check' );
dd $res->{_content};
$res  = $test_api->request( GET '/users/xyz/check' );
dd $res->{_content};
