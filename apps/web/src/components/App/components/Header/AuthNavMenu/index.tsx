import styled from "@emotion/styled";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ACCOUNT_PATH, LANDING_PATH } from "src/constants/routes";
import { logout } from "src/services/auth";
import { useAppDispatch } from "src/services/hooks";
import Avatar from "ui/Avatar";

import NavMenuItem from "../NavMenuItem";

import "./styles.css";

const Wrap = styled(NavMenuItem)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 4px 4px 10px;

  &:hover {
    background-color: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
  }
`;

const AuthNavMenu = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onAccountClick = useCallback(() => {
    navigate(ACCOUNT_PATH);
  }, [navigate]);
  const onLogoutClick = useCallback(() => {
    dispatch(logout()).then(() => {
      navigate(LANDING_PATH);
    });
  }, [dispatch, navigate]);

  return (
    <Wrap className="border-accent-focus border rounded">
      <Avatar alt="user" />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="IconButton bg-transparent"
            aria-label="account menu"
          >
            <HamburgerMenuIcon />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="DropdownMenuContent bg-gray-800 text-primary"
            align="end"
            sideOffset={5}
          >
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
