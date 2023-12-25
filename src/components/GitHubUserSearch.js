import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const APIURL = 'https://api.github.com/users/';

const GitHubUserSearch = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [repos, setRepos] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);
  const [mostUsedLanguages, setMostUsedLanguages] = useState([]);

  const getUser = async (username) => {
    try {
      const { data } = await axios(APIURL + username);
      setUserData(data);
      getRepos(username);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No profile with this username');
      }
    }
  };

  const getRepos = async (username) => {
    try {
      const { data } = await axios(APIURL + username + '/repos');
      setRepos(data);
      calculateAdditionalInfo(data);
    } catch (err) {
      setError('Problem fetching repos');
    }
  };

  const calculateAdditionalInfo = (repos) => {
    let stars = 0;
    let forks = 0;
    let languages = {};

    repos.forEach(async (repo) => {
      try {
        const repoInfo = await axios(repo.url);
        stars += repoInfo.data.stargazers_count;
        forks += repoInfo.data.forks_count;

        const languagesInfo = await axios(repo.languages_url);
        Object.keys(languagesInfo.data).forEach((language) => {
          if (languages[language]) {
            languages[language] += languagesInfo.data[language];
          } else {
            languages[language] = languagesInfo.data[language];
          }
        });

        setTotalStars(stars);
        setTotalForks(forks);
        setMostUsedLanguages(Object.keys(languages));
      } catch (err) {
        setError('Problem fetching additional repo info');
      }
    });
  };

  const createUserCard = (user) => {
    return (
      <div className="card">
        <img src={user.avatar_url} alt={user.name} className="avatar" />
        <div className="user-info">
          <h2>{user.name}</h2>
          <p>{user.bio}</p>
          <ul>
            <li>
              <strong>Followers:</strong> {user.followers}
            </li>
            <li>
              <strong>Following:</strong> {user.following}
            </li>
            <li>
              <strong>Repos:</strong> {user.public_repos}
            </li>
            <li>
              <strong>Total Stars:</strong> {totalStars}
            </li>
            <li>
              <strong>Total Forks:</strong> {totalForks}
            </li>
            {mostUsedLanguages.length > 0 && (
              <li>
                <strong>Most Used Languages:</strong> {mostUsedLanguages.join(', ')}
              </li>
            )}
          </ul>
        </div>
        {repos && repos.length > 0 && (
          <div className="repos-container">
            <h3>Repositories</h3>
            {renderRepos()}
          </div>
        )}
      </div>
    );
  };

  const createErrorCard = (msg) => {
    return (
      <div className="card">
        <h1>{msg}</h1>
      </div>
    );
  };

  const renderRepos = () => {
    return repos.map((repo) => (
      <a key={repo.id} className="repo" href={repo.html_url} target="_blank" rel="noopener noreferrer">
        {repo.name}
      </a>
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = e.target.elements.search.value.trim();

    if (user) {
      getUser(user);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input type="text" name="search" placeholder="Enter GitHub username" />
        <button type="submit">Search</button>
      </form>

      {userData ? (
        createUserCard(userData)
      ) : error ? (
        createErrorCard(error)
      ) : (
        <p>Enter a GitHub username to search</p>
      )}
    </div>
  );
};

export default GitHubUserSearch;
