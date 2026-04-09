import { LocalStorageEnum } from "@/configs/constants";
import { Utility } from "./helper";
import { jwtDecode } from "jwt-decode";

interface TokenModel {
  access_token: string;
  refresh_token: string;
}

interface DecodedToken {
  exp: number;
}

export const getAccessToken = async (code: string | null): Promise<TokenModel | null> => {
  if (!code) {
    return null;
  }

  const contentData = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "AirTicketSystem",
    redirect_uri: "https://airticket2-be.brightsoftsolution.com/auth/callback",
    code: code,
    code_verifier: Utility.CodeVerifier,
  });

  const uri = `${Utility.IdentityServerUri}/connect/token`;

  const token = getToken();
  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: contentData,
    });
    if (response.ok) {
      const responseBody = await response.text();
      const model: TokenModel = JSON.parse(responseBody);

      localStorage.setItem(LocalStorageEnum.AccessToken, model.access_token);
      localStorage.setItem(LocalStorageEnum.RefreshToken, model.refresh_token);

      return { access_token: model.access_token, refresh_token: model.refresh_token };
    } else {
      console.error(`Error: ${response.status} - ${await response.text()}`);
      return null;
    }
  } catch (error) {
    console.error("Exception:", error);
    return null;
  }
};

export const validateToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);

    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      return false; // Token is expired
    }

    return true; // Token is valid
  } catch (error) {
    console.error("Error decoding token:", error);
    return false; // Token is invalid
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(LocalStorageEnum.AccessToken);
};

export const removeToken = () => {
  localStorage.removeItem(LocalStorageEnum.AccessToken);
  localStorage.removeItem(LocalStorageEnum.RefreshToken);
};