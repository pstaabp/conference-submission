package Model::Feedback;

use Moo;
use Types::Standard qw(Str Int);
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has judge_id => (is=>'rw',isa =>Str, default => ""); ## id of the judge
has visual_design => (is=>'rw',isa =>Int, default => 0); ##
has verbal_presentation => (is=>'rw',isa =>Int, default => 0);
has organization_and_logic => (is=>'rw',isa =>Int, default => 0);
has knowledge => (is=>'rw',isa =>Int, default => 0);
has explanations => (is=>'rw',isa =>Int, default => 0);
has overall => (is=>'rw',isa =>Int, default => 0);
has strength_comment => (is=>'rw',isa =>Str, default => "");
has improvement_comment => (is=>'rw',isa =>Str, default => "");

1;
