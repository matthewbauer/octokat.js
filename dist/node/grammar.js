(function() {
  var DEFAULT_HEADER, OBJECT_MATCHER, PREVIEW_HEADERS, TREE_OPTIONS, URL_VALIDATOR;

  URL_VALIDATOR = /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/(zen|octocat|users|issues|gists|emojis|markdown|meta|rate_limit|feeds|events|notifications|notifications\/threads(\/[^\/]+)|notifications\/threads(\/[^\/]+)\/subscription|gitignore\/templates(\/[^\/]+)?|user|user\/(repos|orgs|followers|following(\/[^\/]+)?|emails(\/[^\/]+)?|issues|starred|starred(\/[^\/]+){2}|teams)|orgs\/[^\/]+|orgs\/[^\/]+\/(repos|issues|members|events|teams)|teams\/[^\/]+|teams\/[^\/]+\/(members(\/[^\/]+)?|memberships\/[^\/]+|repos|repos(\/[^\/]+){2})|users\/[^\/]+|users\/[^\/]+\/(repos|orgs|gists|followers|following(\/[^\/]+){0,2}|keys|starred|received_events(\/public)?|events(\/public)?|events\/orgs\/[^\/]+)|search\/(repositories|issues|users|code)|gists\/(public|starred|([a-f0-9]{20}|[0-9]+)|([a-f0-9]{20}|[0-9]+)\/forks|([a-f0-9]{20}|[0-9]+)\/comments(\/[0-9]+)?|([a-f0-9]{20}|[0-9]+)\/star)|repos(\/[^\/]+){2}|repos(\/[^\/]+){2}\/(readme|tarball(\/[^\/]+)?|zipball(\/[^\/]+)?|compare\/[a-f0-9:]{40}\.{3}[a-f0-9:]{40}|deployments(\/[0-9]+)?|deployments\/[0-9]+\/statuses(\/[0-9]+)?|hooks|hooks\/[^\/]+|hooks\/[^\/]+\/tests|assignees|languages|teams|tags|branches(\/[^\/]+){0,2}|contributors|subscribers|subscription|stargazers|comments(\/[0-9]+)?|downloads(\/[0-9]+)?|forks|milestones|labels|releases|releases\/([0-9]+)|releases\/([0-9]+)\/assets|releases\/latest|releases\/tags\/([^\/]+)|releases\/assets\/([0-9]+)|events|notifications|merges|statuses\/[a-f0-9]{40}|pages|pages\/builds|pages\/builds\/latest|commits|commits\/[a-f0-9]{40}|commits\/[a-f0-9]{40}\/(comments|status|statuses)?|contents\/|contents(\/[^\/]+)*|collaborators(\/[^\/]+)?|(issues|pulls)|(issues|pulls)\/(|events|events\/[0-9]+|comments(\/[0-9]+)?|[0-9]+|[0-9]+\/events|[0-9]+\/comments)|pulls\/[0-9]+\/(files|commits)|git\/(refs|refs\/heads(\/[^\/]+)?|trees(\/[^\/]+)?|blobs(\/[a-f0-9]{40}$)?|commits(\/[a-f0-9]{40}$)?)|stats\/(contributors|commit_activity|code_frequency|participation|punch_card))|licenses|licenses\/([^\/]+)|authorizations|authorizations\/((\d+)|clients\/([^\/]{20})|clients\/([^\/]{20})\/([^\/]+))|applications\/([^\/]{20})\/tokens|applications\/([^\/]{20})\/tokens\/([^\/]+)|enterprise\/(settings\/license|stats\/(issues|hooks|milestones|orgs|comments|pages|users|gists|pulls|repos|all))|staff\/indexing_jobs|users\/[^\/]+\/(site_admin|suspended)|setup\/api\/(start|upgrade|configcheck|configure|settings(authorized-keys)?|maintenance)|([^\/]+\/){2}(pull\/([0-9]+(\.diff))))$/;

  TREE_OPTIONS = {
    'zen': false,
    'octocat': false,
    'issues': false,
    'emojis': false,
    'markdown': false,
    'meta': false,
    'rate_limit': false,
    'feeds': false,
    'events': false,
    'notifications': {
      'threads': {
        'subscription': false
      }
    },
    'gitignore': {
      'templates': false
    },
    'user': {
      'repos': false,
      'orgs': false,
      'followers': false,
      'following': false,
      'emails': false,
      'issues': false,
      'starred': false,
      'teams': false
    },
    'orgs': {
      'repos': false,
      'issues': false,
      'members': false,
      'events': false,
      'teams': false
    },
    'teams': {
      'members': false,
      'memberships': false,
      'repos': false
    },
    'users': {
      'repos': false,
      'orgs': false,
      'gists': false,
      'followers': false,
      'following': false,
      'keys': false,
      'starred': false,
      'received_events': {
        'public': false
      },
      'events': {
        'public': false,
        'orgs': false
      },
      'site_admin': false,
      'suspended': false
    },
    'search': {
      'repositories': false,
      'issues': false,
      'users': false,
      'code': false
    },
    'gists': {
      'public': false,
      'starred': false,
      'star': false,
      'comments': false,
      'forks': false
    },
    'repos': {
      'readme': false,
      'tarball': false,
      'zipball': false,
      'compare': false,
      'deployments': {
        'statuses': false
      },
      'hooks': {
        'tests': false
      },
      'assignees': false,
      'languages': false,
      'teams': false,
      'tags': false,
      'branches': false,
      'contributors': false,
      'subscribers': false,
      'subscription': false,
      'stargazers': false,
      'comments': false,
      'downloads': false,
      'forks': false,
      'milestones': false,
      'labels': false,
      'releases': {
        'assets': false,
        'latest': false,
        'tags': false
      },
      'events': false,
      'notifications': false,
      'merges': false,
      'statuses': false,
      'pulls': {
        'merge': false,
        'comments': false,
        'commits': false,
        'files': false,
        'events': false
      },
      'pages': {
        'builds': {
          'latest': false
        }
      },
      'commits': {
        'comments': false,
        'status': false,
        'statuses': false
      },
      'contents': false,
      'collaborators': false,
      'issues': {
        'events': false,
        'comments': false
      },
      'git': {
        'refs': {
          'heads': false
        },
        'trees': false,
        'blobs': false,
        'commits': false
      },
      'stats': {
        'contributors': false,
        'commit_activity': false,
        'code_frequency': false,
        'participation': false,
        'punch_card': false
      }
    },
    'licenses': false,
    'authorizations': {
      'clients': false
    },
    'applications': {
      'tokens': false
    },
    'enterprise': {
      'settings': {
        'license': false
      },
      'stats': {
        'issues': false,
        'hooks': false,
        'milestones': false,
        'orgs': false,
        'comments': false,
        'pages': false,
        'users': false,
        'gists': false,
        'pulls': false,
        'repos': false,
        'all': false
      }
    },
    'staff': {
      'indexing_jobs': false
    },
    'setup': {
      'api': {
        'start': false,
        'upgrade': false,
        'configcheck': false,
        'configure': false,
        'settings': {
          'authorized-keys': false
        },
        'maintenance': false
      }
    }
  };

  OBJECT_MATCHER = {
    'repos': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos\/[^\/]+\/[^\/]+$/,
    'gists': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/gists\/[^\/]+$/,
    'issues': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos\/[^\/]+\/[^\/]+\/issues\/[^\/]+$/,
    'users': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/users\/[^\/]+$/,
    'orgs': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/orgs\/[^\/]+$/,
    'repos.comments': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos\/[^\/]+\/[^\/]+\/comments\/[^\/]+$/,
    'repos.pulls': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/repos\/[^\/]+\/[^\/]+\/pulls\/[^\/]+$/
  };

  PREVIEW_HEADERS = {
    'application/vnd.github.drax-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?(\/licenses|\/licenses\/([^\/]+)|\/repos\/([^\/]+)\/([^\/]+))$/,
    'application/vnd.github.v3.star+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?\/users\/([^\/]+)\/starred$/,
    'application/vnd.github.mirage-preview+json': /^(https?:\/\/[^\/]+)?(\/api\/v3)?(\/authorizations|\/authorizations\/clients\/([^\/]{20})|\/authorizations\/clients\/([^\/]{20})\/([^\/]+)|\/authorizations\/([\d]+)|\/applications\/([^\/]{20})\/tokens|\/applications\/([^\/]{20})\/tokens\/([^\/]+))$/
  };

  DEFAULT_HEADER = function(url) {
    var key, val;
    for (key in PREVIEW_HEADERS) {
      val = PREVIEW_HEADERS[key];
      if (val.test(url)) {
        return key;
      }
    }
    return 'application/vnd.github.v3+json';
  };

  module.exports = {
    URL_VALIDATOR: URL_VALIDATOR,
    TREE_OPTIONS: TREE_OPTIONS,
    OBJECT_MATCHER: OBJECT_MATCHER,
    DEFAULT_HEADER: DEFAULT_HEADER
  };

}).call(this);
