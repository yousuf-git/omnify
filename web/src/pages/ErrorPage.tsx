import { Box } from "@mui/material";
import { NavLink, useNavigate, useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // navigate("/")
    navigate(-1);
    // window.history.back()
  };

  const error: any = useRouteError();
  // console.log(error);
  if (error.status === 404) {
    return (
      <div className="flex flex-col items-center text-gray-800 w-lvw  justify-center">
        <Box className="w-66 h-66 ">
          <figure>
            <img
              src="/404.gif"
              alt="Error 404"
              className="w-fit h-fit object-cover"
            />
          </figure>
        </Box>
        <h1 className="text-lg text-gray-700 mx-5 lg:mx-0 text-center ">
          The Page you were looking for could not be Found.
        </h1>
        <div className="flex flex-row  mt-4 gap-4">
          <button
            className=" px-4 py-2 rounded-md text-white  bg-gray-800 w-auto "
            onClick={handleClick}
          >
            Go Back
          </button>
          <NavLink className="nav-link  " to="/">
            <div className="px-4 py-2 rounded-md text-white  bg-gray-800 w-auto ">
              Back to Home
            </div>
          </NavLink>
        </div>
      </div>
    );
  }
};
