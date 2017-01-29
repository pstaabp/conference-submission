package Model::Author;


use Moo;
use MooX::Types::MooseLike::Base qw(Str);
with 'Common::MongoDBable';

extends 'Model::User';

has major => (is=>'rw',isa =>Str, default => "");
has role => (is=>'rw',isa =>Str, default => ""); ## array of strings

has grad_year => (is=>'rw',isa =>Int, default => 0);
has presented_before => (is=>'rw',isa=>Bool, default=>false);


1;
