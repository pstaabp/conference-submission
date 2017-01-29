package Model::Sponsor;


use Moo;
use MooX::Types::MooseLike::Base qw(Str);
with 'Common::MongoDBable';

extends 'Model::User';

has department => (is=>'rw',isa =>Str, default => "");

1;
