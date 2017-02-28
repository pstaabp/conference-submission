package Model::Proposal;


use Moo;
use Model::Feedback;
use DateTime::Format::Strptime;
use Types::Standard qw(Str ArrayRef Bool InstanceOf);
use Types::XSD;
use Scalar::Util qw(looks_like_number);

use boolean;
with 'Common::MongoDBable';

use Data::Dump qw/dd/;

has author_id => (is=>'lazy',isa =>Str); ## id of the author
has other_authors => (is=>'rw',isa =>ArrayRef[Str], default => sub { return [];}); ## array of Person
has session => (is=>'rw',isa =>Str, default => "");
has sponsor_id => (is=>'rw',isa =>Str, default => ""); ## id of the sponsor
has title => (is=>'rw',isa =>Str, default => "");
has type => (is=>'rw',isa =>Str, default => "");
has accepted => (is=>'rw',isa =>Bool, default => sub {return false;});
has submit_date => (is => 'lazy',isa =>Types::XSD::DateTime);
has content => (is=>'rw',isa =>Str, default => "");
has sponsor_statement => (is=>'rw',isa =>Str, default => "");
has use_human_subjects => (is=>'rw',isa =>Bool, default => sub {return false;});
has human_subjects_number => (is=>'rw',isa =>Str, default => "");
has use_animal_subjects => (is=>'rw',isa =>Bool, default => sub {return false;});
has animal_subjects_number => (is=>'rw',isa =>Str, default => "");
has other_equipment => (is=>'rw',isa =>Str, default => "");
has to_be_judged =>(is=>'ro',isa=>Bool,default=>sub{return false});
has contact_phone =>(is=>'ro',isa=>Str, default=> "");
has feedback => (is=>'rw',isa => ArrayRef[InstanceOf['Model::Feedback']],
        builder=>'_build_feedback');## array of Feedback

sub TO_JSON {
  my $self = shift;
  my $hash = {};
  for my $key (keys %$self){
      if (ref($self->{$key}) eq "DateTime"){
        my $strp = DateTime::Format::Strptime->new(
            pattern   => '%FT%T',
            time_zone => 'America/New_York',
          );
        $hash->{$key}= $strp->format_datetime($self->{$key});
      } else {
        $hash->{$key} = $self->{$key};
      }
    }
    return $hash;

}

sub _build_feedback {
  my $self = shift;
  return [];
}

sub _build_submit_date {
  return DateTime->now();
}

sub _build_author_id {
  dd "in _build_author_id";
  return "1234";}


sub BUILDARGS {
  my $class = shift;
  my %args = @_ == 1 ? %{ $_[0] } : @_;

  # convert the feedback into array ref of objects.
  my @feedback;
  for my $feed (@{$args{feedback}}){
    push @feedback, Model::Feedback->new($feed);
  }

	$args{feedback} = \@feedback;

  if (defined($args{submit_date}) && looks_like_number($args{submit_date})){
    $args{submit_date} = DateTime->from_epoch(epoch=>$args{submit_date});
  } elsif (defined($args{submit_date}) && $args{submit_date} =~ m/\d{4}-\d{2}-\d{2}T\d\d:\d\d:\d\d/){
    my $strp = DateTime::Format::Strptime->new(
        pattern   => '%FT%T',
        time_zone => 'America/New_York',
      );
    $args{submit_date} = $strp->parse_datetime($args{submit_date});
  #} elsif(not defined($args{submit_date})){
  } else {
    $args{submit_date} = DateTime->now;
  }

  return \%args;
}

1;
