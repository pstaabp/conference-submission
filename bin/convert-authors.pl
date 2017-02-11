#
# This script converts the database from where the other_authors were not
# stored as users, but separate.
#


use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;
use MongoDB;
use Data::Dump qw/dd/;
use Model::User;
use List::Util qw/first/;

my $client = MongoDB->connect('mongodb://localhost');
my $pc = $client->ns("conf-2016.proposals");
my @proposals = $pc->find->all;

my $ac = $client->ns("conf-2016.users");
my @all_users = map {Model::User->new($_)} $ac->find->all;
my @new_users;

for my $prop (@proposals){
  my $authors = $prop->{other_authors};
  my @new_author_list;
  for my $auth (@{$authors}){
    #dd $auth->{email};
    my @s = split /\@/, $auth->{email};
    my $falconkey = $s[0];
    #dd $falconkey;
    my $u = first {$_->{falconkey} eq $falconkey} @all_users;
    if (not defined($u)){
      # add this user to the database
      delete $auth->{_id};  # this is an author id not a user _id
      my $new_user = Model::User->new($auth);
      $new_user->falconkey($falconkey);
      #dd $new_user->{falconkey};
      my $u2 = first {$_->{falconkey} eq $new_user->{falconkey}} @new_users;
      push(@new_users,$new_user) unless defined($u2);
    }
    push @new_author_list, $falconkey;
  }
  $prop->{other_authors} = \@new_author_list;
  #dd $prop->{other_authors};
  ## update the proposal in the database;
  #dd $prop->{_id};
  $pc->update_one({_id => $prop->{_id}},{'$set'=>{other_authors => \@new_author_list}});
}
# my @docs = map {$_->to_hash; }@new_users;
# dd \@docs;
#my $out = $ac->insert_many(\@docs);

# dd $out;



# check if user already exists
