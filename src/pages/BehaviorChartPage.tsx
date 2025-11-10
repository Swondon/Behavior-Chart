import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import './BehaviorChartPage.css'; // Make sure this path is correct
import { type Person, type BehaviorChart, behaviorLevels, type ClipRequest } from './charts';
import ShareModal from '../components/ShareModal';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import RequestClipModal from '../components/RequestClipModal'; // This path is correct
import { collection, query, where, doc, updateDoc, arrayUnion, onSnapshot, addDoc, serverTimestamp, writeBatch, arrayRemove } from 'firebase/firestore';
import PendingRequests from '../components/PendingRequests';
import ConfirmModal from '../components/ConfirmModal';
import PencilIcon from '../components/PencilIcon';
import TrashIcon from '../components/TrashIcon';
import CheckIcon from '../components/CheckIcon';

function BehaviorChartPage() {
  const { shareCode } = useParams();
  const [chart, setChart] = useState<BehaviorChart | null>(null);
  const [chartDocId, setChartDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<ClipRequest[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [clipRequestInfo, setClipRequestInfo] = useState<{ person: Person, direction: 'up' | 'down' } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [personToDelete, setPersonToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteChartModalOpen, setIsDeleteChartModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { user, setUser } = useAuth(); // Get the current authenticated user and setUser
  
  useEffect(() => {
    if (!shareCode) return;

    const chartsRef = collection(db, "charts");
    const q = query(chartsRef, where("shareCode", "==", shareCode));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        console.log("No matching chart found.");
        setChart(null);
      } else {
        const chartDoc = querySnapshot.docs[0];
        setChartDocId(chartDoc.id);
        const fetchedChart = chartDoc.data() as BehaviorChart;
        setChart(fetchedChart);
        setNewTitle(fetchedChart.name);

        // --- Logic to automatically add current user if not already in chart ---
        if (user && !fetchedChart.people.some(p => p.id === user.uid)) {
          const joinerPerson: Person = {
            id: user.uid,
            name: user.displayName || 'New User',
            username: user.email ? `@${user.email.split('@')[0]}` : '@user',
            level: 3, // Ready to Learn
          };

          // Add the user to the chart's people array in Firestore
          const chartToUpdateRef = doc(db, "charts", chartDoc.id);
          updateDoc(chartToUpdateRef, {
            people: arrayUnion(joinerPerson),
            memberIds: arrayUnion(user.uid)
          }).catch(error => console.error("Error adding joiner to chart:", error));

          // Also add the chart's shareCode to the user's joinedCharts array in Firestore
          if (user) { // Ensure user is still logged in
            const userRef = doc(db, "users", user.uid);
            updateDoc(userRef, {
              joinedCharts: arrayUnion(fetchedChart.shareCode)
            }).catch(error => console.error("Error adding chart to user's joinedCharts:", error));
            // Update local user context
            setUser((prevUser) => prevUser ? { ...prevUser, joinedCharts: [...(prevUser.joinedCharts || []), fetchedChart.shareCode] } : null);
          }
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chart: ", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [shareCode, user, setUser]); // Add setUser to dependencies

  // Effect to fetch pending clip requests for this chart
  useEffect(() => {
    if (!chart || !user) return;

    const requestsRef = collection(db, "clipRequests");
    const q = query(requestsRef, where("chartShareCode", "==", chart.shareCode), where("status", "==", "pending"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: ClipRequest[] = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() } as ClipRequest);
      });
      setPendingRequests(requests);
    });

    return () => unsubscribe();
  }, [chart, user]);

  const handleLevelChange = async (personId: string, direction: 'up' | 'down') => { // personId is now string
    if (!chart || !chartDocId) return;

    const updatedPeople = chart.people.map(person => {
      if (person.id === personId) {
        const newLevel = direction === 'up' ? person.level - 1 : person.level + 1;
        if (newLevel >= 0 && newLevel < behaviorLevels.length) {
          return { ...person, level: newLevel };
        }
      }
      return person;
    });

    const chartRef = doc(db, "charts", chartDocId);
    await updateDoc(chartRef, { people: updatedPeople });
  };

  const handleClipRequest = (person: Person, direction: 'up' | 'down') => {
    if (!chart || !user) return;

    // If no approval is needed, change level directly
    if (chart.approvalMode === 'none') {
      handleLevelChange(person.id, direction);
      return;
    }

    // Otherwise, open the modal to ask for a reason
    setClipRequestInfo({ person, direction });
  };

  const submitClipRequest = async (reason: string) => {
    if (!clipRequestInfo || !chart || !user) return;

    const { person, direction } = clipRequestInfo;

    const newRequest: Omit<ClipRequest, 'id'> = {
      chartShareCode: chart.shareCode,
      requesterId: user.uid,
      requesterName: user.displayName || 'Anonymous',
      targetPersonId: person.id,
      targetPersonName: person.name,
      direction,
      reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "clipRequests"), newRequest);
      setClipRequestInfo(null); // Close modal
    } catch (error) {
      console.error("Error creating clip request:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request || !user || !chart) return;

    // Prevent non-owners from approving their own requests. The owner can approve anything.
    if (request.requesterId === user.uid && user.uid !== chart.ownerId) {
      console.error("You cannot approve your own request.");
      return;
    }

    // 1. Update the person's level
    await handleLevelChange(request.targetPersonId, request.direction);

    // 2. Update the request status (no notification needed here, as it's an internal action)
    const requestRef = doc(db, "clipRequests", requestId);
    await updateDoc(requestRef, { status: 'approved' });
  };

  const handleRejectRequest = async (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request || !user || !chart) return;

    // Prevent non-owners from rejecting their own requests. The owner can reject anything.
    if (request.requesterId === user.uid && user.uid !== chart.ownerId) {
      console.error("You cannot reject your own request.");
      return;
    }

    const requestRef = doc(db, "clipRequests", requestId);
    await updateDoc(requestRef, { status: 'rejected' });
  };

  const handlePersonNameUpdate = async (personId: string) => {
    if (!chartDocId || !newPersonName.trim()) {
      setEditingPersonId(null);
      return;
    }

    const personToUpdate = chart?.people.find(p => p.id === personId);
    if (!personToUpdate || newPersonName.trim() === personToUpdate.name) {
      setEditingPersonId(null);
      return;
    }

    const updatedPeople = chart!.people.map(p =>
      p.id === personId ? { ...p, name: newPersonName.trim() } : p
    );

    const chartRef = doc(db, "charts", chartDocId);
    try {
      await updateDoc(chartRef, { people: updatedPeople });
      console.log("Person's name updated!");
    } catch (error) {
      console.error("Error updating person's name:", error);
      console.error("Failed to update name.");
    }
    setEditingPersonId(null);
  };

  const confirmPersonDelete = async () => {
    if (!personToDelete) return;
    const { id: personId, name: personName } = personToDelete;
    if (!chart || !chartDocId || !user) return;
    
    if (personId === chart.ownerId) { // The chart owner cannot be removed.
      console.error("The chart owner cannot be removed.");
      return;
    }
    
    try {
      const batch = writeBatch(db);

      // 1. Remove person from the chart's people and memberIds arrays
      const chartRef = doc(db, "charts", chartDocId);
      batch.update(chartRef, { 
        people: arrayRemove(chart.people.find(p => p.id === personId)),
        memberIds: arrayRemove(personId)
      });

      await batch.commit();
      console.log(`${personName} has been removed from the chart.`); // Person has been removed from the chart.
    } catch (error) {
      console.error("Error removing person:", error);
      console.error("Failed to remove person."); // Failed to remove person.
    }
    setPersonToDelete(null);
  };

  const handleDeleteChart = useCallback(async () => {
    if (chart && chartDocId && user && user.uid === chart.ownerId) {
      try {
        const batch = writeBatch(db);

        // 1. Delete the chart document
        const chartRef = doc(db, "charts", chartDocId);
        batch.delete(chartRef);

        // // 2. Remove the chart's shareCode from all members' joinedCharts
        // for (const person of chart.people) {
        //   const userRef = doc(db, "users", person.id);
        //   batch.update(userRef, { joinedCharts: arrayRemove(chart.shareCode) });
        // }
        await batch.commit();
        console.log(`Chart "${chart.name}" deleted successfully.`);
        // Redirect to charts list page after deletion
        return <Navigate to="/charts" replace />;
      } catch (error) {
        console.error("Error deleting chart:", error);
        console.error("Failed to delete chart."); // Failed to delete chart.
      }
    } else {
      console.error("You don't have permission to delete this chart."); // You don't have permission to delete this chart.
    }

  }, [chart, chartDocId, user]);

  const handleTitleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartDocId || !newTitle.trim() || newTitle.trim() === chart?.name) {
      setIsEditingTitle(false);
      if (chart) setNewTitle(chart.name); // Reset to original if empty
      return;
    }

    const chartRef = doc(db, "charts", chartDocId);
    try {
      await updateDoc(chartRef, { name: newTitle.trim() });
      console.log("Chart title updated!");
    } catch (error) {
      console.error("Error updating chart title:", error);
      console.error("Failed to update title.");
    }
    setIsEditingTitle(false);
  };

  const approvableRequests = pendingRequests.filter(req =>
    (chart?.approvalMode === 'owner' && user?.uid === chart.ownerId) ||
    (chart?.approvalMode === 'user' && user?.uid === req.targetPersonId) || // Kept for backward compatibility with old charts
    (chart?.approvalMode === 'any_user' && chart.people.some(p => p.id === user?.uid))
  );

  if (loading) {
    return <div>Loading Chart...</div>;
  }

  if (!chart) {
    // If the chart is null after loading, it means it was not found or the user has no access.
    if (!loading) {
      console.error("Chart not found or you have been removed from it.");
    }
    return <Navigate to="/charts" replace />;
  }

  return (
    <div>
      <Link to="/charts" className="back-to-charts-link">
        &larr; Back to All Charts
      </Link>
      {clipRequestInfo && (
        <RequestClipModal
          personName={clipRequestInfo.person.name}
          direction={clipRequestInfo.direction}
          onClose={() => setClipRequestInfo(null)}
          onSubmit={submitClipRequest}
        />
      )}
      {personToDelete && (
        <ConfirmModal
          isOpen={!!personToDelete}
          onClose={() => setPersonToDelete(null)}
          onConfirm={confirmPersonDelete}
          title="Remove Person"
          message={<>Are you sure you want to remove <strong>{personToDelete.name}</strong> from this chart?</>}
        />
      )}
      {isDeleteChartModalOpen && (
        <ConfirmModal
          isOpen={isDeleteChartModalOpen}
          onClose={() => setIsDeleteChartModalOpen(false)}
          onConfirm={() => {handleDeleteChart(); setIsDeleteChartModalOpen(false)}}
          title="Delete Chart"
          message={<>Are you sure you want to delete the chart "<strong>{chart.name}</strong>"? This action cannot be undone.</>}
        />
      )}
      <div className="chart-header">
        <div className="title-container">
          {isEditingTitle ? (
            <form onSubmit={handleTitleUpdate} className="title-edit-form">
              {/* Input for editing title */}
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="save-title-button">Save</button>
            </form>
          ) : ( // Display title
            <h1>{chart.name}</h1>
          )}
          {user && user.uid === chart.ownerId && !isEditingTitle && (
            <button className="edit-title-button" onClick={() => setIsEditingTitle(true)}><PencilIcon /></button>
          )}
        </div>
        <div className="chart-actions">
          {user && user.uid === chart.ownerId && (
            <button className="delete-chart-button" onClick={() => setIsDeleteChartModalOpen(true)}>
              Delete Chart
            </button>
          )}
          <button className="share-button" onClick={() => setIsShareModalOpen(true)}>
            Share
          </button>
        </div>
      </div>

      <PendingRequests requests={approvableRequests} chart={chart} onApprove={handleApproveRequest} onReject={handleRejectRequest} />

      <div className="visual-chart">
        {behaviorLevels.map((level, index) => (
          <div key={level.name} className="level-row" style={{ backgroundColor: level.color }}>
            <h2 className="level-name">{level.name}</h2>
            <div className="people-in-level">
              {chart.people
                .filter(person => person.level === index)
                .map(person => (
                  <div key={person.id} className="person-clip">
                    <div className="person-main">
                      {editingPersonId === person.id ? (
                        <form className="person-edit-form" onSubmit={(e) => { e.preventDefault(); handlePersonNameUpdate(person.id); }}>
                          <input
                            type="text"
                            value={newPersonName}
                            onChange={(e) => setNewPersonName(e.target.value)}
                            onBlur={() => handlePersonNameUpdate(person.id)}
                            autoFocus
                          />
                          <button type="submit" className="save-person-button"><CheckIcon /></button>
                        </form>
                      ) : (
                        <div className="person-info">
                          <span className="person-name">{person.name}</span>
                          <span className="person-username">{person.username}</span>
                        </div>
                      )}
                      {user && user.uid === chart.ownerId && (
                        <div className="owner-actions">
                          <button
                            className="person-edit-btn"
                            title="Edit name"
                            onClick={() => { setEditingPersonId(person.id); setNewPersonName(person.name); }}
                            disabled={editingPersonId !== null}
                          ><PencilIcon /></button>
                          <button
                            className="person-delete-btn"
                            title={person.id === chart.ownerId ? "Owner cannot be removed" : "Remove person"}
                            onClick={() => setPersonToDelete({ id: person.id, name: person.name })}
                            disabled={person.id === chart.ownerId}
                          ><TrashIcon /></button>
                        </div>
                      )}
                    </div>
                    <div className="button-group">
                      {user && (
                        <>
                          <button className="clip-up-btn" onClick={() => handleClipRequest(person, 'up')} disabled={person.level === 0}>▲ Clip Up</button>
                          <button className="clip-down-btn" onClick={() => handleClipRequest(person, 'down')} disabled={person.level === behaviorLevels.length - 1}>▼ Clip Down</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
      {isShareModalOpen && (
        <ShareModal shareCode={chart.shareCode} onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
}

export default BehaviorChartPage;