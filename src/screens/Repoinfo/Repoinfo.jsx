import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import "./Repoinfo.css"


export default function Repoinfo() {
  const github_api = "https://api.github.com";
  const accessToken = "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";

  
  const [user, setUser] = useState({});
  const [orgs, setOrgs] = useState([])
  const [followers, setFollowers] = useState([])
  
  const { username } = useParams();


  useEffect(
    () => {
      // const getRepos = async () => {
      //   const res = await axios.get(`${github_api}/users/${username}/repos`, {
      //     headers: {
      //       Authorization: `token ${accessToken}`
      //     }
      //   });
      //   setRepos(res.data);
      // };

      const getUser = async () => {
        const res = await axios.get(`${github_api}/users/${username}`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        });
        setUser(res.data);
      };

      const getOrganizations = async () => {
        const res = await axios.get(`${github_api}/users/${username}/orgs`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        })
        setOrgs(res.data)
      }

      const getFollowers = async () => {
        const res = await axios.get(`${github_api}/users/${username}/followers`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        })
        setFollowers(res.data)
      }

      // getRepos();
      getUser();
      getOrganizations()
      getFollowers()
    },
    [username]
  );

  

  // const perPage_f = 100
  // const [url_f, setUrl_f] = useState(`${github_api}/users/${username}/followers`);
  // // const [pagesRemaining_f, setPagesRemaining_f] = useState(true);
  // const [isRender_f, setIsRender_f] = useState(true);
  // const params_f = useMemo(
  //   () => ({
  //     accept: "application/vnd.github+json",
  //     per_page: perPage_f
  //   }),
  //   []
  // );
  
  const headers = useMemo(
    () => ({
      "content-type": "text/plain",
      Authorization: `token ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }),
    [accessToken]
  );

  // //Get repositires
  // const getFollowers = useRef(null);

  // useEffect(
  //   () => {
  //     const nextPattern_f = /(?<=<)([\S]*)(?=>; rel="Next")/i;
  //     let pagesRemaining_f = true;
  //     setIsRender_f(false);
  //     getFollowers.current = async () => {
  //       while(pagesRemaining_f) {
  //         const res = await axios.get(url_f, {
  //           params: params_f,
  //           headers: headers
  //         });
  //         const linkHeader = res.headers.link;
  //         pagesRemaining_f = linkHeader && linkHeader.includes(`rel="next"`)
  //         const parsedData_f = parseData(res.data);

  //         if (pagesRemaining_f) {
  //           setUrl_f(linkHeader.match(nextPattern_f)[0]);
  //         }
  //         if (isRender_f) {
  //           setFollowers(parsedData_f);
  //           break
  //         } else {
  //           setFollowers(prev => [...prev, ...parsedData_f]);
  //         }
  //         // console.log(followers)
  //       }
  //     };
  //   },
  //   [
  //     isRender_f,
  //     headers,
  //     params_f,
  //     url_f,
  //     // followers
  //   ]
  // );

  // useEffect(() => {
  //   if (getFollowers.current) {
  //     getFollowers.current();
  //   }
  // }, []);


  const [repos, setRepos] = useState([]);
  const [pageshow, setPageshow] = useState([]);
  const [url, setUrl] = useState(`${github_api}/users/${username}/repos`);
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

  //Get repositires
  const getRepos = useRef(null);

  useEffect(
    () => {
      const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
      setIsRender(false);
      getRepos.current = async () => {
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
          setRepos(parsedData);
        } else {
          setRepos(prev => [...prev, ...parsedData]);
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
      repos,
      pageshow,
      currentpage
    ]
  );

  useEffect(() => {
    if (getRepos.current) {
      getRepos.current();
    }
  }, []);
  const handleOnNext = async () => {
    if (getRepos.current) {
      if (page === currentpage) {
        getRepos.current();
        setPage(page + 1);
      }

      setCurerntpage(currentpage + 1);
      setPageshow(
        repos.slice(
          perPage * (currentpage + 1),
          perPage * (currentpage + 2)
        )
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
      repos.slice(perPage * (currentpage - 1), perPage * (currentpage))
    );
  };

  const Organizations = (props) => {
    return <>
      <div id="orgs">
        <img src={props.org.avatar_url} alt="" id="orgs-avatar"/>
        <p>{props.org.description}</p>
      </div>
    </>
  }

  const Followers = (props) => {
    return <>
      <div id="orgs">
        <img src={props.follower.avatar_url} alt="" id="orgs-avatar"/>
          <p>{props.follower.login}</p>
      </div>
    </>
  }

  return (
    <>
      <header>
        <b>
          {username}
        </b>
      </header>
      <div id = "repoinfo-body">
        <div id="user-info">          
          <img src={user.avatar_url} alt="" className = "user-avatar"/>
          <div id="user-info-org">
            <h2>Organization</h2>
            <div>
              {orgs.map((org, index) => (
                <div key={index}><Organizations org={org} /></div>
              ))}
            </div>
          </div>
          <div id="user-info-followers">
            <h2>Followers</h2>
            <p>{followers.length}followers</p>
            <div>
              {followers.slice(0, 5).map((follower, index) => (
                <div key={index}><Followers follower={follower} /></div>
              ))}
            </div>
          </div>

        </div>
        <div id="user-repos">
          <div style={{width:"100%", marginBottom:"20px"}}>
            {pageshow.map((repo, index) =>
              <div key={index} id="repos-item">        
                <a href={repo.html_url} target="_blank" rel="noreferrer"><h3>{repo.name}</h3></a>
                <h3>{repo.description}</h3>              
              </div>
            )}
          </div>
          <div style={{display:"flex", gap:"40px"}}>
            <button
              disabled={currentpage === 0 ? true : false}
              onClick={handleOnPrev}
            >
              Prev
            </button>
            <button onClick={handleOnNext}>Next</button>
          </div>

        </div>
      </div>
    </>
  );
}
