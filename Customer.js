import React, { Component } from "react";
import axios from "axios";
import Chatkit from "@pusher/chatkit-client";
import Spinner from "react-spinkit";
import Dialog from "./Dialog";
import ChatWidget from "./ChatWidget";
import { handleInput, sendMessage, connectToRoom } from "./sharedMethods";
import logo from "./logo-1.png";
class Customer extends Component {
  constructor() {
    super();

    this.state = {
      currentUser: null,
      currentRoom: null,
      newMessage: "",
      messages: [],
      isLoading: false,
      userId: "",
      isDialogOpen: false
    };

    this.connectToRoom = connectToRoom.bind(this);
    this.sendMessage = sendMessage.bind(this);
    this.handleInput = handleInput.bind(this);
  }

  showDialog = () => {
    this.setState({
      isDialogOpen: !this.state.isDialogOpen
    });
  };

  addSupportStaffToRoom = () => {
    const { currentRoom, currentUser } = this.state;

    return currentUser.addUserToRoom({
      userId: "support",
      roomId: currentRoom.id
    });
  };

  createRoom = () => {
    const { currentUser } = this.state;

    currentUser
      .createRoom({
        name: currentUser.name,
        private: true
      })
      .then(room => this.connectToRoom(room.id))
      .then(() => this.addSupportStaffToRoom())
      .catch(console.error);
  };

  launchChat = event => {
    event.preventDefault();

    this.setState({
      isDialogOpen: false,
      isLoading: true
    });

    const { userId } = this.state;

    if (userId === null || userId.trim() === "") {
      alert("Invalid userId");
    } else {
      axios
        .post("http://localhost:5200/users", { userId })
        .then(() => {
          const tokenProvider = new Chatkit.TokenProvider({
            url: "http://localhost:5200/authenticate"
          });

          const chatManager = new Chatkit.ChatManager({
            instanceLocator: "v1:us1:5c3ebecb-d595-4018-93f2-fc1698645630",
            userId,
            tokenProvider
          });

          return chatManager.connect().then(currentUser => {
            this.setState(
              {
                currentUser,
                isLoading: false
              },
              () => this.createRoom()
            );
          });
        })
        .catch(console.error);
    }
  };

  render() {
    const {
      newMessage,
      messages,
      currentUser,
      currentRoom,
      isDialogOpen,
      userId,
      isLoading
    } = this.state;

    return (
      <div className="customer-chat">
        <img className="customer-logo" src={logo} alt="logo"/>
        <h2>Need help? Chat with us</h2>
        <h3> For testing open another tab in browser and go to this url https://www.kabir.infantinventory.com/cs/support</h3>

        {currentRoom ? (
          <ChatWidget
            newMessage={newMessage}
            sendMessage={this.sendMessage}
            handleInput={this.handleInput}
            currentUser={currentUser}
            messages={messages}
          />
        ) : (
          <button onClick={this.showDialog} className="contact-btn">
            Contact Support
          </button>
        )}

        {isLoading ? <Spinner name="three-bounce" color="#300d4f" /> : null}

        {isDialogOpen ? (
          <Dialog
            username={userId}
            handleInput={this.handleInput}
            launchChat={this.launchChat}
          />
        ) : null}
      </div>
    );
  }
}

export default Customer;
