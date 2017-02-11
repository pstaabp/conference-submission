package Model::Student;


use Moo;
use Types::Standard qw(Str Int Bool);
use Data::Dump qw/dump dd/;
use boolean;
with 'Common::MongoDBable';

extends 'Model::User';

has major => (is=>'rw',isa =>Str, default => "");
has grad_year => (is=>'rw',isa =>Int, default => 0); #, builder => 'convert_grad_year');
has presented_before => (is => 'rw', isa => Bool);
#has presented_before => (is => 'rw',builder=>'_build_presented_before',isa=>Bool);
#
# sub BUILDARGS {
#   my $orig = shift;
#   my $class = shift;
#   my %args = @_ == 1 ? %{ $_[0] } : @_;
#
#     dd "in Model::Student::BUILDARGS";
#     dd $class;
#     dd %args;
#     # -- modify @args here --
#
#
#
#     return $class->$orig( \%args );
# }

sub _build_presented_before {
  my $self = shift;
   dd "in _build_presented_before";
   dd true;
   my $x =$self ? true: false;
   dd $x;
   return $x;

}


1;
