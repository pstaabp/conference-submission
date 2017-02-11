package Model::Proposal;


use Moo;
use Model::Feedback;
use Types::Standard qw(Str ArrayRef Bool InstanceOf);
use Types::XSD qw/DateTime/;
use boolean;
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has author_id => (is=>'rw',isa =>Str, default => ""); ## id of the author
has other_authors => (is=>'rw',isa =>ArrayRef[Str], default => sub { return [];}); ## array of Person
has session => (is=>'rw',isa =>Str, default => "");
has sponsor_id => (is=>'rw',isa =>Str, default => ""); ## id of the sponsor
has title => (is=>'rw',isa =>Str, default => "");
has accepted => (is=>'rw',isa =>Bool, default => sub {return false;});
has submit_date => (is => 'lazy',isa =>DateTime);
has content => (is=>'rw',isa =>Str, default => "");
has sponsor_statement => (is=>'rw',isa =>Str, default => "");
has use_human_subjects => (is=>'rw',isa =>Bool, default => sub {return false;});
has human_subjects_number => (is=>'rw',isa =>Str, default => "");
has use_animal_subjects => (is=>'rw',isa =>Bool, default => sub {return false;});
has animal_subjects_number => (is=>'rw',isa =>Str, default => "");
has other_equipment => (is=>'rw',isa =>Str, default => "");
has feedback => (is=>'rw',isa => ArrayRef[InstanceOf['Model::Feedback']],
        builder=>'_build_feedback');## array of Feedback

sub _build_feedback {
  my $self = shift;
   dd "in _build_feedback";
   dd $self;
   return [];
}

sub _build_submit_date {
  return DateTime->today();
}


sub BUILDARGS {
  my $class = shift;
  my %args = @_ == 1 ? %{ $_[0] } : @_;

  # convert the feedback into array ref of objects.
  my @feedback;
  for my $feed (@{$args{feedback}}){
    push @feedback, Model::Feedback->new($feed);
  }
	$args{feedback} = \@feedback;
	return \%args;
}

1;
