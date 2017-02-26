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

use List::Util qw/first/;

my $client = MongoDB->connect('mongodb://localhost');
my $judges_collection = $client->ns("conf-2016.judges");
my $user_collection = $client->ns("conf-2016.users");
my $proposal_collection = $client->ns("conf-2016.proposals");
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
  my @fields = split /\@/, $proposal->{sponsor_email};
  my $falconkey = $fields[0];

  #look for the user with this falconkey

  my $res = $user_collection->find_one({falconkey => $falconkey});
  $res->{department} = $proposal->{sponsor_dept};
  my $sponsor = Model::Sponsor->new($res);
  $res = $user_collection->find_one_and_update({falconkey=>$falconkey},
      {'$set'=>{department=>$sponsor->{department}}});
    dd $res;
}
