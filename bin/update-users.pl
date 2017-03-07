#
# This script combines the judges database with the users database
#


use strictures 2;
use feature 'say';
use lib '../lib';
use boolean;
use MongoDB;
use Data::Dump qw/dd/;
use Model::User;
use Model::Judge;
use Model::Sponsor;
use Model::Proposal;
use MongoDB::OID;

use List::Util qw/first/;

my $client = MongoDB->connect('mongodb://localhost');
my $judges_collection = $client->ns("dev-2016.judges");
my $user_collection = $client->ns("dev-2016.users");
my $proposal_collection = $client->ns("dev-2016.proposals");
#my @judges = $judges_collection->find->all;
my @proposals = $proposal_collection->find->all;

# for my $judge (@judges){
#   my @fields = split /\@/, $judge->{email};
#   my $falconkey = $fields[0];
#   # look for the user with this falconkey
#   my $res = $user_collection->find_one({falconkey => $falconkey});
#   $res->{judge_topics} = $judge->{topics};
#   $res->{judge_type} = $judge->{type};
#   my $judge_obj = Model::Judge->new($res);
#   $res = $user_collection->find_one_and_update({falconkey=>$falconkey},
#     {'$set'=>{judge_topics=>$judge->{topics},judge_type=>$judge->{type}}});
#   dd $res;
# }

## update the user database to include deparments for sponsors

for my $proposal (@proposals){
  my $prop = Model::Proposal->new($proposal);
  dd $proposal->{title};

  my ($sponsor,$falconkey);
  if (defined $proposal->{sponsor_email}){
    my @fields = split /\@/, $proposal->{sponsor_email};
    $falconkey = $fields[0];
    #look for the user with this falconkey
    $sponsor = Model::Sponsor->new($user_collection->find_one({falconkey => $falconkey}));
  } else {
    dd $prop->{sponsor_id};
    # my $obj_id = MongoDB::OID->new()
    $sponsor = Model::Sponsor->new($user_collection->find_one({_id=>MongoDB::OID->new(value=>$prop->{sponsor_id})}));
  }
  if (not defined $sponsor->{department}){
      $sponsor->department($proposal->{sponsor_dept});
      $user_collection->find_one_and_update({falconkey=>$falconkey},
          {'$set'=>{department=>$sponsor->{department}}});
  }

  dd $prop->{sponsor_id};
  if (not $prop->sponsor_id){
      $prop->sponsor_id($sponsor->{_id});
      my $prop_id = MongoDB::OID->new(value=>$prop->{_id});
      $proposal_collection->find_one_and_update({_id=>$prop_id},{'$set'=>{sponsor_id=>$prop->{sponsor_id}}});
  }


}
