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
sub authenticate_user {
    my ( $self, $username, $password ) = @_;

    die "username and password must be defined"
      unless defined $username && defined $password;

    my $user = $self->get_user_details($username) or return;

    my $ldap = $self->ldap or return;

    my $mesg = $ldap->bind('fscad\\'.$username, password => $password );
    #$self->app->log(debug=>$mesg);
    #return $mesg;

    $ldap->unbind;
    $ldap->disconnect;

    return not $mesg->is_error;
}
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


    my $client = MongoDB->connect('mongodb://localhost');
    my $collection = $client->ns($self->plugin->app->config->{database_name} . ".users");
    my $user = $collection->find_one({falconkey => $username});
    $user->{_id} = $user->{_id}->{value} if defined($user);
    return $user if defined($user);

    my $ldap = $self->ldap;

    return {} unless defined($ldap);

    my $mesg = $ldap->bind( $self->binddn, password => $self->bindpw );
    my $search = $ldap->search(base => '', filter => "sAMAccountName=".$username);

    my $entry = $search->entry(0);

    return {} unless defined($entry);

    my $params = {
      last_name => $entry->get_value("sn") ||"",
      first_name => $entry->get_value("givenName") ||"",
      email =>  $entry->get_value("mail"),
      falconkey => $entry->get_value("sAMAccountName")
    };

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
    #my $provider = $self->auth_provider;
    #$self->app->log(debug=>"hi");

    die "username must be defined" unless defined $username;
    my $user_details = $self->get_user_details($username) or return;
    return $user_details->{role};
}

1;
