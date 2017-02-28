package Model::User;


use Moo;
use Types::Standard qw(Str ArrayRef);
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has first_name => (is=>'rw',isa =>Str, default => "");
has last_name => (is=>'rw',isa =>Str, default => "");
has email => (is=>'rw',isa =>Str, default => "");  ## required and validate
has falconkey => (is=>'rw',isa =>Str, default => "");
has role => (is=>'rw',isa =>ArrayRef[Str], builder => "_build_role"); ## array of strings

sub _build_role {
  return ["student"];
}

sub TO_JSON { return { %{ shift() } }; }

1;
