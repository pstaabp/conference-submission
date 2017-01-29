package Common::Collection;

use base qw(Exporter);

use MongoDB::OID;
use Data::Dump qw/dd dump/;

our @EXPORT    = ();
our @EXPORT_OK = qw(to_hashes insert_to_db get_all_in_collection get_one_by_id);

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
  # print "in get_all_in_collection: $class \n";
  #print dump $mc->find->all;
  # for my $item ($mc->find->all){
  #   print dump $item;  print "\n";
  #
  # };
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
  my $collection = $client->ns($collection_name);
  my $id_obj = MongoDB::OID->new(value => $id);
  my $result = $collection->find_id($id_obj);
  return $class->new($result);
}



1;
