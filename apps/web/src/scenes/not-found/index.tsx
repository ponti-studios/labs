import LinkButton from "@hominem/components/LinkButton";
import { FileX2, List, SearchX } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Link, useMatch } from "react-router-dom";

const Wrapper = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex flex-col gap-4 w-full justify-center items-center">
			{children}
		</div>
	);
};

function NotFound() {
	if (useMatch("/invites/:id")) {
		return (
			<Wrapper>
				<SearchX size={100} className="text-slate-700" />
				<h2 className="text-2xl font-semibold">
					This invite could not be found.
				</h2>
				<p className="text-md">Sign up to start making lists with friends!</p>
				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	if (useMatch("/invites")) {
		return (
			<Wrapper>
				<List size={100} className="text-slate-700" />
				<h2 className="text-2xl font-semibold">
					Sign up to start making lists with friends!
				</h2>
				<p className="text-md">
					If someone invited you to a list,{" "}
					<Link to="/login" className="text-blue-400 font-semibold">
						log in
					</Link>{" "}
					to view your new list.
				</p>
				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	if (useMatch("/list/:id")) {
		return (
			<Wrapper>
				<FileX2 size={100} className="text-slate-700" />

				<h2 className="text-2xl font-semibold">
					This list could not be found.
				</h2>

				<p className="text-md">
					If you think this is a mistake,{" "}
					<Link to="/login" className="text-blue-400 font-semibold">
						log in
					</Link>{" "}
					to view your lists.
				</p>

				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			<SearchX size={100} className="text-slate-700" />
			<h1 className="text-3xl font-semibold mb-16">
				We can't find the page you're looking for.
			</h1>
			<p>Log in to find your lists.</p>
			<LinkButton href="/login" className="font-semibold">
				Log in
			</LinkButton>
		</Wrapper>
	);
}

export default NotFound;
