package Common::MongoDBable;

use strictures 2;
use Moo::Role;
use boolean;
use Data::Dump qw/dd dump/;
use Data::Structure::Util qw( unbless );
use Types::Standard qw(Str);

has _id => (is=>'ro');

around BUILDARGS => sub {
  my $orig = shift;
  my $class = shift;
  my %args = @_ == 1 ? %{ $_[0] } : @_;

  if (ref($args{_id}) eq "MongoDB::OID") {
    $args{_id} = $args{_id}->{value};
  }
  for my $key (keys %args){
    if (ref($args{$key}) eq "boolean" || ref($args{$key}) eq "JSON::PP::Boolean"){
        $args{$key} = boolean($args{$key}) ? true : false;
    }
  }

  return $class->$orig( \%args );
};

sub insert_to_db_common {
  my ($self,$client,$collection_name) = @_;  # need to pass a mongo collection
  my $collection = $client->ns($collection_name);
  my $result = $collection->insert_one($self);
  $self->{_id} = $result->{inserted_id}->{value};
  return $self
}

sub update_in_db {
  my ($self,$client,$collection_name) = @_;
  my $collection = $client->ns($collection_name);
  ##dd $self;
  my $id_obj = MongoDB::OID->new(value =>$self->_id);
  my $params = $self->to_hash;
  delete $params->{_id};
  my $db_resp = $collection->find_one_and_replace({_id => $id_obj},$params);

  return $db_resp;
}

sub remove_from_db_common {
  my ($self,$client,$collection_name) = @_;
  my $collection = $client->ns($collection_name);
  my $id_obj = MongoDB::OID->new(value =>$self->_id);
  $collection->delete_one({_id => $id_obj});
  return $self->to_hash;

}

sub to_hash {
   my $self= shift;

   my $hash = {};
   for my $key (keys %$self){
       if (ref($hash->{$key}) eq "DateTime"){
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

1;
