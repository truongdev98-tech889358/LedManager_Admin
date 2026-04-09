import { getAccessToken } from "@/utils/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      getAccessToken(code).then(async (result) => {
        if (result) {
          navigate("/");
          window.location.reload();
        } else {
          // Handle missing code
          //const urlParams = new URLSearchParams(window.location.search);
          //const code = urlParams.get("code");

          // if (!code) {
          //   getAuthorizationUrl().then((url) => {
          //     window.location.href = url;
          //   });
          // }
        }
      });
    } else {
      // Handle missing code
      navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Authorizing...</h1>
    </div>
  );
};

export default AuthCallback;
