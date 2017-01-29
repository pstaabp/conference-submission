package Model::User;


use Moo;
use MooX::Types::MooseLike::Base qw(Str);
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has user_id => (is=>'rw',isa =>Str, default => "");
has first_name => (is=>'rw',isa =>Str, default => "");
has last_name => (is=>'rw',isa =>Str, default => "");
has email => (is=>'rw',isa =>Str, default => "");  ## required and validate
has falconkey => (is=>'rw',isa =>Str, default => "");
has role => (is=>'rw',isa =>Str, default => ""); ## array of strings

1;
