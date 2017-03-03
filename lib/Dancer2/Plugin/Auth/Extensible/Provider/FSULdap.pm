package Dancer2::Plugin::Auth::Extensible::Provider::FSULdap;

use feature 'say';
use Moo;
use Net::LDAP;
use Data::Dump qw/dump/;
use Model::User;
use Model::Sponsor;

extends 'Dancer2::Plugin::Auth::Extensible::Provider::LDAP';


# hook after_authenticate_user => sub {
#   my $self = shift;
#
#  #print $self;
#
# };

# use Carp qw/croak/;
# use Dancer2::Core::Types qw/ArrayRef/;
# use List::Util qw/first/;
# use Moo;
# with "Dancer2::Plugin::Auth::Extensible::Role::Provider";
#
# use Data::Dump qw/dump/;
#
#
# sub authenticate_user {
#     my ($self, $username, $password) = @_;
#
#     debug config;
#     croak "username and password must be defined"
#       unless defined $username && defined $password;
#
#     my $user_details = $self->get_user_details($username) or return;
#     return $self->match_password($password, $user_details->{pass});
# }
#
# =head2 get_user_details $username
#
# =cut
#
# # Just return the whole user definition from the config; this way any additional
# # fields defined for users will just get passed through.
sub get_user_details {
    my ($self, $username,$realm) = @_;

    die "username must be defined" unless defined $username;

    my $ldap = new Net::LDAP($self->app->config->{ldap_server});

    return {} unless defined($ldap);

    my $msg = $ldap->bind($self->app->config->{ldap_bind}, password => $self->app->config->{ldap_password});

    my $search = $ldap->search(base => '', filter => "sAMAccountName=".$username);



    my $entry = $search->entry(0);

    return {} unless defined($entry);

    my $params = {
      last_name => $entry->get_value("sn") ||"",
      first_name => $entry->get_value("givenName") ||"",
      email =>  $entry->get_value("mail"),
      falconkey => $entry->get_value("sAMAccountName")
    };

    my $user;
    if($entry->get_value("mail") =~ /\@student\./){
      $params->{role} = ["student"];
      $user = Model::User->new($params);
    } else {
      $params->{role} = ["sponsor"];
      $params->{department} = $entry->get_value("department") ||"";
      $user = Model::Sponsor->new($params);
    }
    return $user->TO_JSON;
}
#
# =head2 get_user_roles $username
#
# =cut
#
sub get_user_roles {
    my ($self, $username) = @_;
    #return ["in get_user_roles",$self->get_user_details("$username")];
    die "username must be defined" unless defined $username;
    my $user_details = $self->get_user_details($username) or return;
    return $user_details->{role};
}

1;
