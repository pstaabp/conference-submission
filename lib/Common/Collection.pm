package Common::Collection;

use base qw(Exporter);
use feature 'say';

use MongoDB::OID;
use Data::Dump qw/dd dump/;

our @EXPORT    = ();
our @EXPORT_OK = qw(to_hashes insert_to_db get_all_in_collection get_one_by_id
                      delete_one_by_id update_one);

###
#  input: array reference of Model::Modules
#  ouput:  array reference of hash representations
#
###

sub to_hashes {
  my $modules = shift;
  my @output = map { $_->to_hash} @{$modules};
  return \@output;
}

##
#
#  A common inserting to the database.
#
#  Note: needs some error checking.

sub insert_to_db {

  my ($client,$collection_name,$obj) = @_;
  my $collection = $client->ns($collection_name);
  my $result = $collection->insert_one($obj);
  $obj->{_id} = $result->{inserted_id}->{value};
  return $obj;
}

###
#
#  This returns a reference to an array of all items in a given collection
#
###

sub get_all_in_collection {
  my ($client,$collection_name,$class) = @_;  # need to pass a mongo collection
  my $mc = $client->ns($collection_name);
  my @items = map {$class->new($_);} $mc->find->all;
  return \@items;
}

###
#
#  this finds an object of type class from the collection
#
###

sub get_one_by_id {
  my ($client,$collection_name,$class,$id) = @_;
  say "in get_one_by_id";
  #dd $collection_name;
  my $collection = $client->ns($collection_name);
  my $id_obj = MongoDB::OID->new(value => $id);
  #dd $id_obj;
  my $result = $collection->find_id($id_obj);
  #dd $result;
  return $class->new($result);
}

###
#
#  this finds an object of type class from the collection
#
###

sub update_one {
  my ($client,$collection_name,$obj) = @_;
  say "in update_one";
  my $collection = $client->ns($collection_name);
  # dd $obj;
  my $id_obj = MongoDB::OID->new(value => $obj->{_id});
  # dd $id_obj;
  my $obj_as_hash = $obj->to_hash;
  delete $obj_as_hash->{_id};
  # dd $obj_as_hash;

  my $result = $collection->update_one({_id =>$id_obj},{'$set' => $obj_as_hash});
  # dd $result;
  # todo:  check that this was succesful

  return $obj;
}



###
#
# delete one from the database
#
###

sub delete_one_by_id {
  my ($client,$collection_name,$class,$id) = @_;
  say "in delete_one_by_id";
  my $collection = $client->ns($collection_name);
  my $id_obj = MongoDB::OID->new(value => $id);
  return $collection->find_one_and_delete({_id=>$id_obj});
}


1;
