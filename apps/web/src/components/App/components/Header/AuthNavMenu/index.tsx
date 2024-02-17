import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { List, LogOut, Mail, Menu, Search, Settings } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ACCOUNT,
  DASHBOARD,
  INVITES,
  LANDING,
  LISTS,
} from "src/constants/routes";
import { logout } from "src/services/auth";
import { useAppDispatch } from "src/services/hooks";
import { useAuth } from "src/services/store";

import "./styles.css";

const AuthNavMenu = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const onListsClick = useCallback(() => {
    navigate(LISTS);
  }, [navigate]);
  const onInvitesClick = useCallback(() => {
    navigate(INVITES);
  }, [navigate]);
  const onAccountClick = useCallback(() => {
    navigate(ACCOUNT);
  }, [navigate]);
  const onLogoutClick = useCallback(() => {
    dispatch(logout()).then(() => {
      navigate(LANDING);
    });
  }, [dispatch, navigate]);

  return (
    <>
      <div className="hidden md:visible md:flex-1 md:flex justify-center gap-16">
        <Link to={DASHBOARD} className="text-black">
          <Search />
        </Link>
        <Link to={LISTS} className="text-black">
          <List />
        </Link>
        <Link to={INVITES} className="text-black">
          <Mail />
        </Link>
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="IconButton" aria-label="account menu">
          <Menu />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="DropdownMenuContent"
            align="end"
            sideOffset={5}
          >
            <DropdownMenu.Item className="flex justify-end text-sm pr-2 py-2 text-secondary-content hover:outline-none">
              {user.email}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="DropdownMenuItem text-black flex gap-4"
              onClick={onListsClick}
            >
              <List size={20} />
              Lists
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="DropdownMenuItem text-black flex gap-4"
              onClick={onInvitesClick}
            >
              <Mail size={20} />
              Invites
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="DropdownMenuItem text-black flex gap-4"
              onClick={onAccountClick}
            >
              <Settings size={20} />
              Account
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="DropdownMenuItem text-black flex gap-4"
              onClick={onLogoutClick}
            >
              <LogOut size={20} />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};

export default AuthNavMenu;
