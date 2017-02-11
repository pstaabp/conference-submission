package Model::Proposal;


use Moo;
use Types::Standard qw(Str ArrayRef Bool);
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has author_id => (is=>'rw',isa =>Str, default => ""); ## id of the author
has other_authors => (is=>'rw',isa =>ArrayRef['User'], default => ""); ## array of Person
has session => (is=>'rw',isa =>Str, default => "");
has sponsor_id => (is=>'rw',isa =>Str, default => ""); ## id of the sponsor
has title => (is=>'rw',isa =>Str, default => "");
has accepted => (is=>'rw',isa =>Bool, default => "");
has submit_date => (is=>'rw',isa =>Date, default => "");
has content => (is=>'rw',isa =>Str, default => "");
has sponsor_statement => (is=>'rw',isa =>Str, default => "");
has use_human_subjects => (is=>'rw',isa =>Bool, default => "");
has human_subjects_number => (is=>'rw',isa =>Str, default => "");
has use_animal_subjects => (is=>'rw',isa =>Bool, default => "");
has animal_subjects_number => (is=>'rw',isa =>Str, default => "");
has other_equipment => (is=>'rw',isa =>Str, default => "");
has feedback => (is=>'rw',isa =>isa => ArrayRef['Feedback'], default => []);## array of Feedback

1;
