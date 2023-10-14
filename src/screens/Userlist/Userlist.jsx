import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./Userlist.css";
import axios from "axios";

export default function Userlist() {
  // const base_url = "http://localhost:3000"
  const github_api = "https://api.github.com";
  const accessToken = "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";

  const [users, setUsers] = useState([]);
  const [pageshow, setPageshow] = useState([]);
  const [url, setUrl] = useState(github_api + "/users");
  const [pagesRemaining, setPagesRemaining] = useState(true);

  const [isRender, setIsRender] = useState(true);

  const [page, setPage] = useState(0);

  const [currentpage, setCurerntpage] = useState(0);

  const perPage = 20;

  const params = useMemo(
    () => ({
      accept: "application/vnd.github+json",
      per_page: perPage
    }),
    []
  );
  const headers = useMemo(
    () => ({
      "content-type": "text/plain",
      Authorization: `token ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }),
    [accessToken]
  );

  function parseData(data) {
    // If the data is an array, return that
    if (Array.isArray(data)) {
      return data;
    }

    // Some endpoints respond with 204 No Content instead of empty array
    //   when there is no data. In that case, return an empty array.
    if (!data) {
      return [];
    }

    // Otherwise, the array of items that we want is in an object
    // Delete keys that don't include the array of items
    delete data.incomplete_results;
    delete data.repository_selection;
    delete data.total_count;
    // Pull out the array of items
    const namespaceKey = Object.keys(data)[0];
    data = data[namespaceKey];

    return data;
  }

  const getUsers = useRef(null);

  useEffect(
    () => {
      const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
      setIsRender(false);
      getUsers.current = async () => {
        const res = await axios.get(url, {
          params: params,
          headers: headers
        });
        const linkHeader = res.headers.link;
        setPagesRemaining(linkHeader && linkHeader.includes(`rel="next"`));
        const parsedData = parseData(res.data);

        if (pagesRemaining) {
          setUrl(linkHeader.match(nextPattern)[0]);
        }
        if (isRender) {
          setUsers(parsedData);
        } else {
          setUsers(prev => [...prev, ...parsedData]);
        }
        if (page === currentpage) {
          setPageshow(parsedData);
        }
      };
    },
    [
      pagesRemaining,
      isRender,
      headers,
      params,
      url,
      page,
      users,
      pageshow,
      currentpage
    ]
  );

  useEffect(() => {
    if (getUsers.current) {
      getUsers.current();
    }
  }, []);
  const handleOnNext = async () => {
    if (getUsers.current) {
      if (page === currentpage) {
        getUsers.current();
        setPage(page + 1);
      }

      setCurerntpage(currentpage + 1);
      setPageshow(
        users.slice(perPage * (currentpage + 1), perPage * (currentpage + 2))
      );
      console.log("page", page + 1);
      console.log("currentpage", currentpage + 1);
    }
  };

  const handleOnPrev = async () => {
    setCurerntpage(currentpage - 1);
    console.log("page", page);
    console.log("currentpage", currentpage - 1);
    setPageshow(
      users.slice(perPage * (currentpage - 1), perPage * currentpage)
    );
  };

  const User = props => {
    return (
      <div
        id="user-div"
        style={{
          backgroundColor: props.index % 2 === 0 ? "#edeef2" : "#d4d5d9"
        }}
      >
        <img src={props.user.avatar_url} alt="" id="user-avatar" />
        <Link to={`repos/${props.user.login}`}>
          {props.user.login}
        </Link>
      </div>
    );
  };
  return (
    <div id="userlist-body">
      {pageshow.map((user, index) =>
        <div key={index}>
          <User user={user} index={index} />
        </div>
      )}
      <button
        disabled={currentpage === 0 ? true : false}
        onClick={handleOnPrev}
      >
        Prev
      </button>
      <button onClick={handleOnNext}>Next</button>
    </div>
  );
}
