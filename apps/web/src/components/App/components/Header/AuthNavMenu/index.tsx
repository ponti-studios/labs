import styled from "@emotion/styled";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ACCOUNT, INVITES, LANDING, LISTS } from "src/constants/routes";
import { logout } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import Avatar from "ui/Avatar";

import NavMenuItem from "../NavMenuItem";

import "./styles.css";
import { getUser } from "src/services/store";

const Wrap = styled(NavMenuItem)`
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
  }
`;

const AuthNavMenu = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(getUser);
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
    <Wrap>
      <Avatar alt="user" />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="IconButton" aria-label="account menu">
          <HamburgerMenuIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="DropdownMenuContent"
            align="end"
            sideOffset={5}
          >
            {user ? (
              <DropdownMenu.Item className="flex justify-end text-sm pr-2 py-2 text-secondary-content hover:outline-none">
                {user.email}
              </DropdownMenu.Item>
            ) : null}
            <DropdownMenu.Item
              className="DropdownMenuItem text-primary"
              onClick={onListsClick}
            >
              Lists
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="DropdownMenuItem text-primary"
              onClick={onInvitesClick}
            >
              Invites
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="DropdownMenuItem text-primary"
              onClick={onAccountClick}
            >
              Account
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="DropdownMenuItem text-primary"
              onClick={onLogoutClick}
            >
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </Wrap>
  );
};

export default AuthNavMenu;
