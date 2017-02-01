## This contains all of the html templates for the app
package Routes::Templates;
use Dancer2;

use Dancer2::Plugin::Auth::Extensible;
use Common::Collection qw/to_hashes get_all_in_collection/;
use Data::Dump qw/dump/;

# This sets that if there is a template in the view direction a route is automatically generated.
set auto_page => 0;

get '/' => sub {
    redirect '/index';
};

get '/index' =>  require_login sub {
  if (user_has_role('student')) {
    redirect '/welcome-student';
  }
  if (user_has_role("sponsor")){
    redirect '/welcome';
  }
};

get '/login' => sub {
    template 'login';
};

post '/login' => sub {
    debug params;
    my ($success, $realm) = authenticate_user(
        params->{username}, params->{password}
    );
    if ($success) {
        # change session ID if we have a new enough D2 version with support
        # (security best practice on privilege level change)
        app->change_session_id if app->can('change_session_id');
        session logged_in_user => params->{username};
        session logged_in_user_realm => $realm;
        # other code here
    } else {
        # authentication failed
    }
};

get '/test' => sub {
  dump config;
  template 'test';
};

get '/welcome-student' => require_login sub {
  debug dump config;
  debug logged_in_user;
  debug get_user_details(logged_in_user()->{username});
  template 'welcome-student', {user=>get_user_details(logged_in_user->{user})};
};

get '/welcome' => require_login sub {
  debug logged_in_user;
  my $username = logged_in_user->{user};
  debug $username;
  debug get_user_details($username);
  template 'welcome', {user=>get_user_details(logged_in_user->{user})};
};

any '/logout' => sub {
    app->destroy_session;
    template 'logout';
};

get '/student' => sub {

    template 'basic', {top_dir=> "",header_script=>"student.tt"};
};

get '/problemsets' => sub {
    my $params = getAllData();
    $params->{appname} = "ProblemSetsView";
    template 'problemsets', $params;
};

get '/problem' => sub {
    my $params = getAllData();
    $params->{appname} = "AddProblemView";
    $params->{header} = "Add New Problem";
    template 'problem', $params;

};

get '/problems/:problem_id' => sub {

    debug "in GET /problems/:problem_id";
    my $params = getAllData();
    $params->{appname} = "AddProblemView";
    $params->{header} = "Problem Editor";
    $params->{id} = route_parameters->{problem_id};
    template 'problem', $params;
};

get '/problemsets/:set_id' => sub {
  my $params = getAllData();
  $params->{appname} = "ProblemSetView";
  $params->{header} = "Problem Set Editor";
  $params->{set_id} = route_parameters->{set_id};
  template 'problemset', $params;
};


get '/modules' => sub {
    my $client = MongoDB->connect('mongodb://localhost');
    my $modules = to_hashes(get_all_in_collection($client,"problemdb.modules","Model::Module"));
    template 'modules', {appname => "EditModulesView",modules=> to_json($modules)};
};

sub login_page {
  template 'login';

}

sub getAllData {
    my $client = MongoDB->connect('mongodb://localhost');
    # print "in getAllData\n";
    my $authors = to_hashes(get_all_in_collection($client,"problemdb.authors","Model::Author"));
    my $modules = to_hashes(get_all_in_collection($client,"problemdb.modules","Model::Module"));
    my $problems = to_hashes(get_all_in_collection($client,"problemdb.problems","Model::Problem"));
    my $problem_sets = to_hashes(get_all_in_collection($client,"problemdb.problemsets","Model::ProblemSet"));

    return {  authors => to_json($authors),
              modules=> to_json($modules),
              problems => to_json($problems),
              problem_sets => to_json($problem_sets) };
}

true;
