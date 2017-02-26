package Model::Judge;

use Types::Standard qw/Str ArrayRef/;
use boolean;
use Moo;
with 'Common::MongoDBable';

extends 'Model::User';

has judge_type => (is=>'ro',isa =>Str, default => "");
has judge_topics => (is=>'ro',isa => ArrayRef[Str],builder=>"_build_judge_topics");

sub _build_judge_topics {
  my $self = shift;
  return [];
}


true;
