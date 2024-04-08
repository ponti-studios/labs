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

const NotFoundHeader = ({ children }: PropsWithChildren) => {
	return <h1 className="text-2xl font-semibold">{children}</h1>;
};

const NotFoundDescription = ({ children }: PropsWithChildren) => {
	return <p className="text-md">{children}</p>;
};

function NotFound() {
	if (useMatch("/invites/:id")) {
		return (
			<Wrapper>
				<SearchX size={100} className="text-slate-700" />
				<NotFoundHeader>This invite could not be found.</NotFoundHeader>
				<NotFoundDescription>
					Sign up to start making lists with friends!
				</NotFoundDescription>
				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	if (useMatch("/invites")) {
		return (
			<Wrapper>
				<List size={100} className="text-slate-700" />
				<NotFoundHeader>
					Sign up to start making lists with friends!
				</NotFoundHeader>
				<NotFoundDescription>
					If someone invited you to a list,{" "}
					<Link to="/login" className="text-blue-400 font-semibold">
						log in
					</Link>{" "}
					to view your new list.
				</NotFoundDescription>
				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	if (useMatch("/list/:id")) {
		return (
			<Wrapper>
				<FileX2 size={100} className="text-slate-700" />

				<NotFoundHeader>This list could not be found.</NotFoundHeader>

				<NotFoundDescription>
					If you think this is a mistake,{" "}
					<Link to="/login" className="text-blue-400 font-semibold">
						log in
					</Link>{" "}
					to view your lists.
				</NotFoundDescription>

				<LinkButton href="/signup">Go to list</LinkButton>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			<SearchX size={100} className="text-slate-700" />
			<NotFoundHeader>
				We can't find the page you're looking for.
			</NotFoundHeader>
			<LinkButton href="/login" className="font-semibold">
				Log in
			</LinkButton>
		</Wrapper>
	);
}

export default NotFound;
