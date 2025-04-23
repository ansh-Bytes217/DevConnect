
import React, { useState } from 'react';

const Meet = () => {
  const [code, setCode] = useState('');
  const [meetingStarted, setMeetingStarted] = useState(false);

  const generateCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCode(randomCode);
    setMeetingStarted(true);
  };

  const handleJoin = () => {
    if (code.length === 6) {
      setMeetingStarted(true);
    } else {
      alert('Please enter a valid 6-digit code.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-indigo-600">DevConnect Meet</h2>

      {!meetingStarted ? (
        <div className="space-y-4">
          <div>
            <button
              onClick={generateCode}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 font-semibold"
            >
              Create a Meet Room
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray-300 rounded-xl p-2 w-60 text-center"
            />
            <button
              onClick={handleJoin}
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 font-semibold"
            >
              Join Meet
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-700">Meeting Room Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span></p>
          <iframe
            src={`https://meet.jit.si/DevConnectRoom${code}`}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: '100%', height: '600px', border: '0px' }}
            title={`DevConnect Meet - ${code}`}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Meet;
