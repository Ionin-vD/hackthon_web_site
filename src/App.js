import React from "react";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import "./App.css";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function saveDataToLocalStorage(key, data) {
  try {
    // Преобразуем объект или массив данных в строку JSON
    const jsonData = JSON.stringify(data);

    // Сохраняем данные в локальном хранилище под указанным ключом
    localStorage.setItem(key, jsonData);

    //console.log("Данные успешно сохранены в локальном хранилище.");
  } catch (error) {
    // Обработка ошибок, если не удалось сохранить данные
    console.error("Ошибка при сохранении данных в локальном хранилище:", error);
  }
}

function getDataFromLocalStorage(key) {
  try {
    // Получаем данные из локального хранилища по указанному ключу
    const jsonData = localStorage.getItem(key);

    // Проверяем, есть ли данные с указанным ключом в хранилище
    if (jsonData === null) {
      //console.log(`Данные с ключом '${key}' не найдены в локальном хранилище.`);
      return null;
    }

    // Преобразуем строку JSON в объект или массив данных
    const data = JSON.parse(jsonData);

    //console.log("Данные успешно загружены из локального хранилища.");
    return data;
  } catch (error) {
    // Обработка ошибок, если не удалось получить данные
    console.error("Ошибка при загрузке данных из локального хранилища:", error);
    return null;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="div-main">
      <Router>
        <div>
          <div className="div-app-header">
            <h1>Hack Teams</h1>

            <div className="div-menu-navigation">
              <Menu isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            </div>
          </div>
        </div>

        <div className="div-body">
          <Routes>
            <Route
              path="/"
              element={
                <Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              }
            />
            <Route
              path="/page-auth"
              element={<AuthPage setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/page-karusel/:id"
              element={<ProductPage setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/lk" element={<Lk setIsLoggedIn={setIsLoggedIn} />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

function Lk({ setIsLoggedIn }) {
  const [bannerUrl, setBannerUrl] = useState("");
  const [participantFields, setParticipantFields] = useState([
    { name: "", serName: "", patronymic: "", imageUrl: "", stack: "", id: "" },
  ]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  function chengaDisplay({ flag, playerId }) {
    const element = document.querySelector(".changePerson");

    axios
      .get(`http://213.226.126.10:8080/player/get/${playerId}`)
      .then((response) => {
        const { name, serName, patronymic, imageUrl, stack } = response.data;
        const playerData = {
          id: playerId,
          name: name,
          serName: serName,
          patronymic: patronymic,
          imageUrl: imageUrl,
          stack: stack,
        };
        setSelectedPlayer(playerData);
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
      });

    if (element) {
      if (flag) {
        element.style.display = "block";
        //console.log(selectedPlayer);
      } else {
        element.style.display = "none";
      }
    }
  }

  function Team({ team }) {
    const { players, teams } = team;

    return (
      <div className="div-page-t">
        <div className="team-info">
          <h1>{team.team.title}</h1>
          <img src={team.team.imageUrl} alt="Team Banner" />
          <div className="teams-card">
            <label className="label-field" style={{ width: "450px" }}>
              <input
                type="text"
                className="auth-input"
                placeholder="Баннер (URL)"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
            </label>
            <button
              className="change-data-button"
              style={{
                width: "15%",
                marginBottom: "10px",
                marginTop: "0px",
                height: "100%",
              }}
              onClick={updateInfoTeam}
            >
              Изменить баннер
            </button>
          </div>
          <h3>Участники:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index} className="player-item">
                <img
                  style={{ width: "80px", height: "80px" }}
                  src={player.imageUrl}
                  alt={`Player ${index}`}
                />
                <div className="player-info">
                  <div>
                    {player.name} {player.serName} {player.patronymic} (
                    {player.stack})
                  </div>
                  <div>
                    <button
                      className="change-data-button"
                      onClick={() =>
                        chengaDisplay({ flag: true, playerId: player.id })
                      }
                    >
                      Изменить данные
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="teams-button">
            <Link to={"/"}>
              <button
                onClick={() => {
                  saveDataToLocalStorage("station", false);
                  setIsLoggedIn(false);
                }}
                className="div-quit-button"
                style={{ width: "150px" }}
              >
                Выход
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const [teams, setTeams] = useState([]);

  const updateInfoTeam = () => {
    if (bannerUrl.trim() === "") {
      alert(" URL баннера не может быть пустым.");
      return; // Прерываем выполнение функции, если URL пустой
    }
    const data = {
      imageUrl: bannerUrl,
    };
    //Создайте объект с данными для отправки на сервер
    axios
      .put(
        `http://213.226.126.10:8080/team/update/${getDataFromLocalStorage(
          "id"
        )}`,
        data
      )
      .then((response) => {
        // Обработайте ответ от сервера
        //console.log("Ответ от сервера:", response.data);
        setBannerUrl("");
        window.location.reload();
        // setParticipantFields([
        //   { name: "", serName: "", patronymic: "", imageUrl: "", stack: "" },
        // ]);
      })
      .catch((error) => {
        // Обработайте ошибку, если запрос не удалось выполнить
        console.error("Ошибка при выполнении запроса:", error);
      });
  };

  function updateInfoPlayer({ players }) {
    const element = document.querySelector(".changePerson");
    const data = {
      name: players.serName,
      serName: players.name,
      patronymic: players.patronymic,
      imageUrl: players.imageUrl,
      stack: players.stack,
    };
    //Создайте объект с данными для отправки на сервер
    axios
      .put(`http://213.226.126.10:8080/player/update/${players.id}`, data)
      .then((response) => {
        // Обработайте ответ от сервера
        //console.log("Ответ от сервера:", response.data);
        //setBannerUrl("");
        window.location.reload();
        setParticipantFields([
          { name: "", serName: "", patronymic: "", imageUrl: "", stack: "" },
        ]);
      })
      .catch((error) => {
        // Обработайте ошибку, если запрос не удалось выполнить
        console.error("Ошибка при выполнении запроса:", error);
      });
    element.style.display = "none";
  }

  // Запрос на сервер при загрузке страницы
  useState(() => {
    axios
      .get(
        `http://213.226.126.10:8080/team/get/${getDataFromLocalStorage("id")}`
      )
      .then((response) => {
        const { team, players } = response.data;
        const teamsData = [
          {
            team: {
              title: team.title,
              imageUrl: team.imageUrl,
              login: team.login,
              password: team.password,
              email: team.email,
            },
            players: players.map((player) => ({
              id: player.id,
              name: player.name,
              serName: player.serName,
              patronymic: player.patronymic,
              imageUrl: player.imageUrl,
              stack: player.stack,
            })),
          },
        ];
        setTeams(teamsData);
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
      });
  }, []);

  return (
    <>
      <div className="team-card">
        <h2></h2>
        <div className="teams-list">
          {teams.map((team, index) => (
            <Team key={index} team={team} />
          ))}
        </div>

        <div className="changePerson" style={{ display: "none" }}>
          <div className="div-participants">
            {participantFields.map((participant, index) => (
              <div
                className="div-participant div-first-participant"
                key={index}
              >
                <label>
                  <input
                    type="text"
                    className="change-data-input"
                    placeholder="Имя:"
                    value={selectedPlayer ? selectedPlayer.serName : ""}
                    onChange={(e) => {
                      const updatedFields = [...participantFields];
                      updatedFields[index].serName = e.target.value;
                      setParticipantFields(updatedFields);

                      const updatedPlayer = {
                        ...selectedPlayer,
                        serName: e.target.value,
                      };
                      setSelectedPlayer(updatedPlayer);
                    }}
                  />
                </label>
                <label>
                  <input
                    type="text"
                    className="change-data-input"
                    placeholder="Фамилия"
                    value={selectedPlayer ? selectedPlayer.name : ""}
                    onChange={(e) => {
                      const updatedFields = [...participantFields];
                      updatedFields[index].name = e.target.value;
                      setParticipantFields(updatedFields);

                      const updatedPlayer = {
                        ...selectedPlayer,
                        name: e.target.value,
                      };
                      setSelectedPlayer(updatedPlayer);
                    }}
                  />
                </label>

                <label>
                  <input
                    type="text"
                    className="change-data-input"
                    placeholder="Отчество"
                    value={selectedPlayer ? selectedPlayer.patronymic : ""}
                    onChange={(e) => {
                      const updatedFields = [...participantFields];
                      updatedFields[index].patronymic = e.target.value;
                      setParticipantFields(updatedFields);

                      const updatedPlayer = {
                        ...selectedPlayer,
                        patronymic: e.target.value,
                      };
                      setSelectedPlayer(updatedPlayer);
                    }}
                  />
                </label>

                <label>
                  <input
                    type="url"
                    className="change-data-input"
                    placeholder="Фото участника (URL)"
                    value={selectedPlayer ? selectedPlayer.imageUrl : ""}
                    onChange={(e) => {
                      const updatedFields = [...participantFields];
                      updatedFields[index].imageUrl = e.target.value;
                      setParticipantFields(updatedFields);

                      const updatedPlayer = {
                        ...selectedPlayer,
                        imageUrl: e.target.value,
                      };
                      setSelectedPlayer(updatedPlayer);
                    }}
                  />
                </label>

                <label className="div-last-participant">
                  <input
                    type="text"
                    className="change-data-input div-last-participant"
                    placeholder="Стэк участника:"
                    value={selectedPlayer ? selectedPlayer.stack : ""}
                    onChange={(e) => {
                      const updatedFields = [...participantFields];
                      updatedFields[index].stack = e.target.value;
                      setParticipantFields(updatedFields);

                      const updatedPlayer = {
                        ...selectedPlayer,
                        stack: e.target.value,
                      };
                      setSelectedPlayer(updatedPlayer);
                    }}
                  />
                </label>
                <button
                  className="change-data-button"
                  onClick={() => updateInfoPlayer({ players: selectedPlayer })}
                >
                  Сохранить изменения
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function RegisterPage() {
  //const history = useHistory();
  const [teamName, setTeamName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [participantFields, setParticipantFields] = useState([
    { name: "", serName: "", patronymic: "", imageUrl: "", stack: "" },
  ]);
  const [participantCount, setParticipantCount] = useState(0); // Состояние для отслеживания количества участников

  // Обработчик изменения значений полей
  const handleChange = (setValue) => (e) => setValue(e.target.value);

  // Добавление нового участника
  const handleAddParticipant = () => {
    if (participantCount < 5) {
      setParticipantFields([
        ...participantFields,
        { name: "", serName: "", patronymic: "", imageUrl: "", stack: "" },
      ]);
      setParticipantCount(participantCount + 1);
    }
  };

  // Регистрация команды
  const handleRegister = (event) => {
    // Проверка на заполненность всех полей
    if (!teamName || !bannerUrl || !email || !login || !password) {
      alert("Пожалуйста, заполните все поля");
      //return false;
      event.preventDefault();
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Пожалуйста, введите корректный адрес электронной почты");
      //return;
      event.preventDefault();
    } else if (password.length < 8) {
      alert("Пароль должен содержать не менее 8 символов");
      //return;
      event.preventDefault();
    } else if (!/[A-Z]/.test(password)) {
      alert("Пароль должен содержать хотя бы одну заглавную букву");
      //return;
      event.preventDefault();
    } else if (!/[a-z]/.test(password)) {
      alert("Пароль должен содержать хотя бы одну строчную букву");
      //return;
      event.preventDefault();
    } else if (!/\d/.test(password)) {
      alert("Пароль должен содержать хотя бы одну цифру");
      //return;
      event.preventDefault();
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      alert("Пароль должен содержать хотя бы один специальный символ");
      //return;
      event.preventDefault();
    } else if (!/^[a-zA-Z0-9]{3,20}$/.test(login)) {
      alert(
        "Логин должен содержать только латинские буквы и цифры, минимум 3 символа"
      );
      //return;
      event.preventDefault();
    } else {
      //history.push('/');
      //Создайте объект с данными для отправки на сервер
      const data = {
        team: {
          title: teamName,
          imageUrl: bannerUrl,
          login: login,
          password: password,
          email: email,
        },
        players: participantFields,
      }; // Выполните POST-запрос к серверу
      axios
        .post("http://213.226.126.10:8080/team/add_team", data)
        .then((response) => {
          // Обработайте ответ от сервера
          //console.log("Ответ от сервера:", response.data);
          alert("Вы успешно зарегистрировали команду");
          setTeamName("");
          setBannerUrl("");
          setEmail("");
          setLogin("");
          setPassword("");
          setParticipantFields([
            { name: "", serName: "", patronymic: "", imageUrl: "", stack: "" },
          ]);
        })
        .catch((error) => {
          // Обработайте ошибку, если запрос не удалось выполнить
          console.error("Ошибка при выполнении запроса:", error);
          //alert("Ошибка при выполнении запроса");
        });
    }
  };

  return (
    <div className="div-reg">
      <h2 className="h2-auth-text">Регистрация</h2>
      <div className="team-reg-menu">
        <label className="label-field">
          <input
            type="text"
            className="auth-input"
            placeholder="Название команды"
            value={teamName}
            onChange={handleChange(setTeamName)}
          />
        </label>
        <label className="label-field">
          <input
            type="text"
            className="auth-input"
            placeholder="Баннер (URL)"
            value={bannerUrl}
            onChange={handleChange(setBannerUrl)}
          />
        </label>
        <label className="label-field">
          <input
            type="email"
            className="auth-input"
            placeholder="Электронная почта"
            value={email}
            onChange={handleChange(setEmail)}
          />
        </label>
        <label className="label-field">
          <input
            type="text"
            className="auth-input"
            placeholder="Логин"
            value={login}
            onChange={handleChange(setLogin)}
          />
        </label>
        <label className="label-field">
          <input
            type="password"
            className="auth-input"
            placeholder="Пароль:"
            value={password}
            onChange={handleChange(setPassword)}
          />
        </label>
      </div>
      <h3>Участники</h3>
      <div className="div-participants">
        {participantFields.map((participant, index) => (
          <div className="div-participant div-first-participant" key={index}>
            <label>
              <input
                type="text"
                className="auth-input"
                placeholder="Имя:"
                value={participant.name}
                onChange={(e) => {
                  const updatedFields = [...participantFields];
                  updatedFields[index].name = e.target.value;
                  setParticipantFields(updatedFields);
                }}
              />
            </label>
            <label>
              <input
                type="text"
                className="auth-input"
                placeholder="Фамилия"
                value={participant.serName}
                onChange={(e) => {
                  const updatedFields = [...participantFields];
                  updatedFields[index].serName = e.target.value;
                  setParticipantFields(updatedFields);
                }}
              />
            </label>
            <label>
              <input
                type="text"
                className="auth-input"
                placeholder="Отчество"
                value={participant.patronymic}
                onChange={(e) => {
                  const updatedFields = [...participantFields];
                  updatedFields[index].patronymic = e.target.value;
                  setParticipantFields(updatedFields);
                }}
              />
            </label>
            <label>
              <input
                type="url"
                className="auth-input"
                placeholder="Фото участника (URL)"
                value={participant.imageUrl}
                onChange={(e) => {
                  const updatedFields = [...participantFields];
                  updatedFields[index].imageUrl = e.target.value;
                  setParticipantFields(updatedFields);
                }}
              />
            </label>
            <label className="div-last-participant">
              <input
                type="text"
                className="auth-input div-last-participant"
                placeholder="Стэк участника:"
                value={participant.stack}
                onChange={(e) => {
                  const updatedFields = [...participantFields];
                  updatedFields[index].stack = e.target.value;
                  setParticipantFields(updatedFields);
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <button
        className="but-add-member-button"
        onClick={handleAddParticipant}
        disabled={participantCount >= 5}
      >
        Добавить участника
      </button>

      <Link to={`/`}>
        <button className="div-reg-team-button" onClick={handleRegister}>
          Зарегистрировать команду
        </button>
      </Link>
    </div>
  );
}

function ProductPage({ numberId }) {
  const [designRating, setDesignRating] = useState(0);
  const [usabilityRating, setUsabilityRating] = useState(0);
  const [markupRating, setMarkupRating] = useState(0);
  const [implementationRating, setImplementationRating] = useState(0);
  const { id } = useParams();

  const handleSubmit = () => {
    // Здесь вы можете отправить данные оценок на сервер или выполнить другие действия
    // console.log("Отправка данных:", {
    //   designRating,
    //   usabilityRating,
    //   markupRating,
    //   implementationRating,
    // });
  };

  const Star = ({ filled, onClick }) => (
    <span style={{ cursor: "pointer" }} onClick={onClick}>
      {filled ? "★" : "☆"}
    </span>
  );

  function Team({ team }) {
    const { players, teams } = team;

    return (
      <div className="div-page-t">
        <div className="team-info">
          <h1>{team.team.title}</h1>
          <img src={team.team.imageUrl} alt="Team Banner" />
          <h3>Участники:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index} className="player-item" style={{ padding: "0" }}>
                <img
                  style={{ width: "80px", height: "80px" }}
                  src={player.imageUrl}
                  alt={`Player ${index}`}
                />
                <div className="player-info">
                  <div>
                    {player.name} {player.serName} {player.patronymic} (
                    {player.stack})
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="table-score" style={{display:"none"}}>
          <h2>Оцените работу!</h2>
          <div>
            <div>
              <div>
                <p>Дизайн</p>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    filled={value <= designRating}
                    onClick={() => setDesignRating(value)}
                  />
                ))}
              </div>
              <div>
                <p>Юзабилити</p>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    filled={value <= usabilityRating}
                    onClick={() => setUsabilityRating(value)}
                  />
                ))}
              </div>
              <div>
                <p>Верстка</p>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    filled={value <= markupRating}
                    onClick={() => setMarkupRating(value)}
                  />
                ))}
              </div>
              <div>
                <p>Реализация</p>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    filled={value <= implementationRating}
                    onClick={() => setImplementationRating(value)}
                  />
                ))}
              </div>
              <button className="change-data-button" onClick={handleSubmit}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [teams, setTeams] = useState([]);

  // Запрос на сервер при загрузке страницы
  useState(() => {
    axios
      .get(`http://213.226.126.10:8080/team/get/${id}`)
      .then((response) => {
        const { team, players } = response.data;
        const teamsData = [
          {
            team: {
              title: team.title,
              imageUrl: team.imageUrl,
              login: team.login,
              password: team.password,
              email: team.email,
            },
            players: players.map((player) => ({
              name: player.name,
              serName: player.serName,
              patronymic: player.patronymic,
              imageUrl: player.imageUrl,
              stack: player.stack,
            })),
          },
        ];
        setTeams(teamsData);
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
      });
  }, []);

  return (
    <div className="team-card">
      <div className="teams-list">
        {teams.map((team, index) => (
          <Team key={index} team={team} />
        ))}
      </div>
    </div>
  );
}

function AuthPage({ isLoggedIn, setIsLoggedIn }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginChange = (e) => {
    setLogin(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    // Проверка наличия логина и пароля
    if (!login || !password) {
      alert("Введите логин и пароль");
      //return;
      e.preventDefault();
    } else {
      const data = {
        login: login,
        password: password,
      }; // Выполните POST-запрос к серверу
      axios
        .post("http://213.226.126.10:8080/team/check_auth", data)
        .then((response) => {
          // Обработайте ответ от сервера
          //console.log("Ответ от сервера:", response.data.team.id);
          setIsLoggedIn(true);
          saveDataToLocalStorage("id", response.data.team.id);
          saveDataToLocalStorage("station", true);
        })
        .catch((error) => {
          // Обработайте ошибку, если запрос не удалось выполнить
          console.error("Ошибка при выполнении запроса:", error);
          //alert("Ошибка при выполнении запроса");
        });
    }
  };
  return (
    <div>
      <div>
        <h2 className="h2-auth-text">Вход в личный кабинет</h2>
      </div>

      <div className="div-auth">
        <div className="div-authorisation-card">
          <div>
            <label>
              <input
                type="text"
                className="auth-input"
                value={login}
                onChange={handleLoginChange}
                placeholder="Логин"
              />
            </label>
          </div>
          <div>
            <label>
              <input
                type="password"
                className="auth-input"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Пароль"
              />
            </label>
          </div>
          <Link to={`/`}>
            <button className="div-auth-button" onClick={handleLogin}>
              Вперёд!
            </button>
          </Link>

          <Link to={`/register`}>
            <button className="but-reg-button">
              <strong>Регистрация</strong>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RatingTable() {
  const ratings = [
    {
      id: 123,
      idTeam: 123,
      scoreDesign: 8,
      scoreUsability: 7,
      scoreImplementation: 6,
      scoreGeneral: 7,
      countNumber: 1,
    },
    // Добавьте другие записи, если необходимо
  ];

  return (
    <div className="rating-container">
      <div className="table-wrapper">
        <table className="rating-table">
          <thead>
            <tr>
              <th>id команды</th>
              <th>Оценка дизайна</th>
              <th>Оценка удобства</th>
              <th>Оценка реализации</th>
              <th>Общая оценка</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.idTeam}</td>
                <td>{rating.scoreDesign}</td>
                <td>{rating.scoreUsability}</td>
                <td>{rating.scoreImplementation}</td>
                <td>{rating.scoreGeneral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    axios
      .get("http://213.226.126.10:8080/team/get_all")
      .then((response) => {
        // Обработка ответа от сервера
        const fetchedTeams = response.data.map((team) => ({
          id: team.team.id,
          name: team.team.title,
          banner: team.team.imageUrl,
        }));
        setTeams(fetchedTeams);
      })
      .catch((error) => {
        // Обработка ошибки при выполнении запроса
        console.error("Ошибка при выполнении запроса:", error);
      });
  }, []);

  // Функция для обработки смены слайдов
  function handleSlideChange(index) {
    const newIndex = currentSlide + index;

    // Обработка случаев перехода к началу или концу списка
    if (newIndex >= teams.length) {
      setCurrentSlide(0);
    } else if (newIndex < 0) {
      setCurrentSlide(teams.length - 1);
    } else {
      setCurrentSlide(newIndex);
    }
  }

  const settings = {
    dots: false, // Отображение точек навигации
    infinite: true, // Зацикленность слайдера
    // fade: true,
    /*autoplay: true,
    autoplaySpeed: 4000,*/
    speed: 1000, // Скорость анимации переключения слайдов (в миллисекундах)
    slidesToShow: 3, // Количество отображаемых слайдов одновременно
    slidesToScroll: 1, // Количество прокручиваемых слайдов за один раз
    responsive: [
      {
        breakpoint: 768, // Разрешение экрана, на котором применяются следующие настройки
        settings: {
          slidesToShow: 1, // Количество отображаемых слайдов на экранах до 768 пикселей ширины
        },
      },
    ],
  };

  // Обработчик прокрутки колеса мыши
  function handleWheelScroll(e) {
    // Определение направления прокрутки
    const delta = Math.sign(e.deltaY);

    // Изменение слайда в соответствии с направлением прокрутки
    if (delta === 1) {
      handleSlideChange(1); // Прокрутка вниз, сдвигаем карусель влево
    } else if (delta === -1) {
      handleSlideChange(-1); // Прокрутка вверх, сдвигаем карусель вправо
    }
  }

  const ratings = [
    {
      id: 123,
      idTeam: 1,
      scoreDesign: 10,
      scoreUsability: 10,
      scoreImplementation: 10,
      scoreGeneral: 1,
      countNumber: 2,
    },
    {
      id: 122,
      idTeam: 2,
      scoreDesign: 7,
      scoreUsability: 8,
      scoreImplementation: 6,
      scoreGeneral: 1,
      countNumber: 2,
    },
    {
      id: 122,
      idTeam: 3,
      scoreDesign: 8,
      scoreUsability: 8,
      scoreImplementation: 7,
      scoreGeneral: 1,
      countNumber: 2,
    },
    {
      id: 122,
      idTeam: 3,
      scoreDesign: 4,
      scoreUsability: 5,
      scoreImplementation: 6,
      scoreGeneral: 1,
      countNumber: 2,
    },
    {
      id: 122,
      idTeam: 4,
      scoreDesign: 12,
      scoreUsability: 20,
      scoreImplementation: 16,
      scoreGeneral: 1,
      countNumber: 4,
    },
    {
      id: 122,
      idTeam: 5,
      scoreDesign: 4,
      scoreUsability: 5,
      scoreImplementation: 6,
      scoreGeneral: 1,
      countNumber: 2,
    },
    {
      id: 122,
      idTeam: 6,
      scoreDesign: 12,
      scoreUsability: 20,
      scoreImplementation: 16,
      scoreGeneral: 1,
      countNumber: 4,
    },
  ];

  return (
    <>
      <div className="div-karusel" onWheel={handleWheelScroll}>
        <Slider
          {...settings}
          className="slider-block"
          style={{ margin: "10px" }}
        >
          {teams.map((team, index) => (
            <Link key={team.id} to={`/page-karusel/${team.id}`}>
              <div
                className="div-carousel-item"
                style={{ width: "200px", height: "200px" }}
              >
                <Team team={team} />
              </div>
            </Link>
          ))}
        </Slider>
      </div>

      <div className="rating-container">
        <h2 className="h2-auth-text">Таблица рейтинга</h2>
        <div className="table-wrapper">
          <div className="table-header">
            <div className="row">
              <div>id команды</div>
              <div>Оценка дизайна</div>
              <div>Оценка удобства</div>
              <div>Оценка реализации</div>
              <div>Общая оценка</div>
            </div>
          </div>
          <div className="table-body">
            {ratings.map((rating, index) => (
              <div className="row" key={index}>
                <div>{rating.idTeam}</div>
                <div>{rating.scoreDesign / rating.countNumber}</div>
                <div>{rating.scoreUsability / rating.countNumber}</div>
                <div>{rating.scoreImplementation / rating.countNumber}</div>
                <div>
                  {(rating.scoreDesign / rating.countNumber +
                    rating.scoreUsability / rating.countNumber +
                    rating.scoreImplementation / rating.countNumber) /
                    3}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Team(props) {
  const { name, banner } = props.team;

  return (
    <div className="team-item">
      <img src={banner} alt="Team Banner" />
      <h2>{name}</h2>
    </div>
  );
}

function Menu({ isLoggedIn, setIsLoggedIn }) {
  if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
    setIsLoggedIn(getDataFromLocalStorage("station"));
  }
  return (
    <>
      <div className="div-menu">
        <Link to="/">Главная</Link>
        {isLoggedIn ? (
          <Link to="/lk">Личный кабинет</Link>
        ) : (
          <Link to="/page-auth">Авторизация</Link>
        )}
      </div>
    </>
  );
}

export default App;
