defmodule Lgchat.ChatController do
	use Lgchat.Web, :controller

	def index(conn, _params) do
		render conn, "lobby.html"
	end
end

