import pytest
import json
from app import app

@pytest.fixture
def client():
    app.testing = True
    with app.test_client() as client:
        yield client


def test_names_pokemon(client, monkeypatch):
    """Test that /names returns a list of Pokémon"""
    mock_data = {"results": [{"name": "pikachu"}, {"name": "charmander"}]}

    def mock_get(url):
        class MockResponse:
            status_code = 200
            def json(self):
                return mock_data
        return MockResponse()

    monkeypatch.setattr("requests.get", mock_get)

    response = client.get("/names")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "pikachu" in data


def test_update_endpoint(client):
    """Test posting to /update"""
    res = client.post("/update", json={"action": "set_name", "name": "pikachu"})
    assert res.status_code == 200


def test_stream_is_accessible(client):
    """Check that /stream is reachable (SSE endpoint)"""
    res = client.get("/stream")
    assert res.status_code in (200, 501)  # 501 if SSE not implemented locally
