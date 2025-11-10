import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type BehaviorChart } from './charts';
import './ChartListPage.css';
import JoinChartModal from '../components/JoinChartModal';
import CreateChartModal from '../components/CreateChartModal'; // Ensure this is imported
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Correctly typed as Firestore
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function ChartListPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [charts, setCharts] = useState<BehaviorChart[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const chartsRef = collection(db, 'charts');

    // A single, real-time query for all charts the user is a member of.
    // This includes charts they own and charts they've joined.
    // Firestore requires an index for this query: (memberIds array-contains, name asc).
    const chartsQuery = query(
      chartsRef,
      where('memberIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chartsQuery, (snapshot) => {
      const userCharts: BehaviorChart[] = [];
      snapshot.forEach((doc) => {
        // This client-side check is a safeguard, though the query should be sufficient.
        const chart = doc.data() as BehaviorChart;
        if (chart.memberIds?.includes(user.uid)) {
          userCharts.push(chart);
        }
      });
      setCharts(userCharts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching charts:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [user]);

  return (
    <div>
      <div className="list-page-header">
        <h1>My Behavior Charts</h1>
        <div className="list-page-actions">
          <button className="create-button" onClick={() => setIsCreateModalOpen(true)}>
            Create Chart
          </button>
          <button className="join-button" onClick={() => setIsJoinModalOpen(true)}>
            Join a Chart
          </button>
        </div>
      </div>

      {isJoinModalOpen && <JoinChartModal onClose={() => setIsJoinModalOpen(false)} />}
      {isCreateModalOpen && <CreateChartModal onClose={() => setIsCreateModalOpen(false)} />}

      {loading ? (
        <p>Loading your charts...</p>
      ) : charts.length > 0 ? (
        <div className="chart-list">
          {charts.map(chart => (
            <Link key={chart.shareCode} to={`/chart/${chart.shareCode}`} className="chart-list-item">
              {chart.name}
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-charts-container">
          <h2>No charts yet!</h2>
          <p>Get started by creating your first behavior chart.</p>
          <button className="create-button" onClick={() => setIsCreateModalOpen(true)}>
            Create Your First Chart
          </button>
        </div>
      )}
    </div>
  );
}

export default ChartListPage;