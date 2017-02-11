package Dancer2::Plugin::Auth::Extensible::Provider::FSULdap;

use feature 'say';
use Moo;
use Net::LDAP;
use Data::Dump qw/dump/;

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
    my ($self, $username) = @_;

    die "username must be defined" unless defined $username;

    my $ldap = new Net::LDAP('ldaps://fsudc1.fsc.int:3269');

    return {} unless defined($ldap); 

    my $msg = $ldap->bind('fscad\\webworkldap', password => 'MonDec211215' );

    my $search = $ldap->search(base => '', filter => "sAMAccountName=superman");


    #dd $msg->entries;


    my $entry = $search->entry(0);
    #dd $entry->attributes;
    return {falconkey => $username,
            first_name => $entry->get_value("givenName"),
            last_name => $entry->get_value("sn"),
            other=> $entry->get_value("description")
    };
}
#
# =head2 get_user_roles $username
#
# =cut
#
# sub get_user_roles {
#     my ($self, $username) = @_;
#
#     croak "username must be defined"
#       unless defined $username;
#
#     my $user_details = $self->get_user_details($username) or return;
#     return $user_details->{roles};
# }

1;
