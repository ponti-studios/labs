import { FileX2, SearchX } from "lucide-react";
import { PropsWithChildren } from "react";
import { Link, useLocation, useMatch } from "react-router-dom";

const Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col gap-4 w-full justify-center items-center">
      {children}
    </div>
  );
};

function NotFound() {
  const isListRoute = useMatch("/list/:id");
  const pathname = useLocation().pathname;

  if (pathname.indexOf("invites") !== -1) {
    return (
      <Wrapper>
        <FileX2 size={100} className="text-slate-700" />
        <h2 className="text-2xl font-semibold">
          This invite could not be found.
        </h2>
        <p className="text-md">
          If someone invited you to a list,{" "}
          <Link to="/login" className="text-blue-400 font-semibold">
            log in
          </Link>{" "}
          to view your new list.
        </p>
      </Wrapper>
    );
  }

  if (isListRoute) {
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
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SearchX size={100} className="text-slate-700" />
      <h1 className="text-3xl font-semibold mb-16">You seem to be lost!</h1>
      <Link
        to="/"
        className="font-semibold btn btn-primary max-w-[150px] text-white"
      >
        Go home
      </Link>
    </Wrapper>
  );
}

export default NotFound;
