import styled from "@emotion/styled";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ACCOUNT_PATH, LANDING_PATH } from "src/constants/routes";
import { logout } from "src/services/auth";
import { User } from "src/services/auth/auth.types";
import Avatar from "ui/Avatar";
import NavMenuItem from "ui/NavMenuItem";

import "./styles.css";
import { useAppDispatch } from "src/services/hooks";

const Wrap = styled(NavMenuItem)`
  display: flex;
  gap: 10px;
  border: 1px solid slateblue;
  border-radius: 50px;
  padding: 4px;
  margin: -4px -4px 0 0;

  &:hover {
    box-shadow: 0px 2px 5px 0px slateblue;
  }
`;

const AuthNavMenu = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onAccountClick = useCallback(() => {
    navigate(ACCOUNT_PATH);
  }, [navigate]);
  const onLogoutClick = useCallback(() => {
    dispatch(logout()).then(() => {
      navigate(LANDING_PATH);
    });
  }, []);

  return (
    <Wrap>
      <Avatar />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="IconButton" aria-label="account menu">
            <HamburgerMenuIcon />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="DropdownMenuContent"
            align="end"
            sideOffset={5}
          >
            <DropdownMenu.Item
              className="DropdownMenuItem"
              onClick={onAccountClick}
            >
              Account
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="DropdownMenuSeparator" />
            <DropdownMenu.Item
              className="DropdownMenuItem"
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
