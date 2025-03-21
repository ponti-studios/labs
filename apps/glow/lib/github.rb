require 'httparty'
require 'pry'

module GitHub

  class User
    include HTTParty
    base_uri 'https://api.github.com/users'
    format :json

    def profile username
      self.class.get "/#{username}"
    end

    def repos username
      self.class.get("/#{username}/repos").inject([]) { |repos, i| repos << i['full_name'] }
    end

    def total_commits username
      repos(username).inject(0) { |commits,repo| commits += owner_commits(repo) }
    end
  end

  class Repo
    include HTTParty
    base_uri 'https://api.github.com/repos'
    format :json

    def commits repo
      self.class.get("/#{repo}/stats/participation")
    end

    def owners_commits repo
      self.commits['owner'].reject.reduce(&:+)
    end
  end

  class Client
    include HTTParty
    base_uri 'https://api.github.com/'
    format :json

    def initialize options
      @access_token = options[:token]
      @token_type = options[:type]
      @api_key = { query: { access_token: @access_token, token_type: @token_type } }
    end

    def request path
      self.class.get("/#{path}", @api_key)
    end

    def rate_limit
      self.request 'rate_limit'
    end
  end

end

octokitty = GitHub::Client.new({ token: ENV['GITHUB'], type: 'bearer' })

binding.pry

