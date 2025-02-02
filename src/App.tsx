import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import { ToastContainer } from "react-toastify";
import ViewSection from './components/view/ViewSection';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/listview" element={<ViewSection />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
